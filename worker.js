import indexHTML from "./frontend/index.html"
import adminHTML from "./frontend/admin.html"
import adminLoginHTML from "./frontend/admin_login.html"
import notFoundHTML from "./frontend/404.html"
import picoCSS from "./frontend/pico.min.css"
import stylesCSS from "./frontend/styles.css"

const cookieName = "url-shortener-token"
const cookieAppendices = "Path=/; Secure; HttpOnly; SameSite=Strict"

const corsHeaders = { 
	"access-control-allow-origin": "*",
	"access-control-allow-headers": "x-api-key"
}

function isValidShortname(inShortname) {
	return /^[a-zA-Z0-9-_]{1,20}$/.test(inShortname);
}

function isValidHttpUrl(inURL) {
	try {
		const url = new URL(inURL)
		return url.protocol === "http:" || url.protocol === "https:"
	} catch { return false }
}

async function getSafeRedirectMapping(env) {
	try {
		const rawData = await env.DB.get("redirect-mapping", { type: "text" })
		return rawData ? JSON.parse(rawData) : {}
	} catch { return {} }
}

export default {
	async fetch(request, env) {
		const { method, url } = request
		const { pathname } = new URL(url)

		const authOk = async (token) => {
			if (!token || !env.ADMIN_TOKEN) return false;
			return token === String(env.ADMIN_TOKEN);
		}
		const getCookieToken = () => request.headers.get("Cookie")?.match(/url-shortener-token=([^;]+)/)?.[1]

		// 1. 静态资源路由优先
		if (pathname === "/styles.css") return new Response(stylesCSS, { headers: { "content-type": "text/css" } })
		if (pathname === "/pico.min.css") return new Response(picoCSS, { headers: { "content-type": "text/css" } })

		// 2. API 路由
		if (pathname.startsWith("/api/")) {
			const token = request.headers.get("x-api-key") || getCookieToken()
			
			if (pathname === "/api/shortlink") {
				if (method === "GET") {
					return new Response(JSON.stringify(await getSafeRedirectMapping(env)), { headers: { "content-type": "application/json", ...corsHeaders } })
				}
				if (!await authOk(token)) return new Response("Unauthorized", { status: 401 })
				
				if (method === "POST") {
					const body = await request.json()
					if (!isValidShortname(body.name) || !isValidHttpUrl(body.target)) return new Response("Invalid input", { status: 400 })
					const mapping = await getSafeRedirectMapping(env)
					mapping[body.name] = body.target
					await env.DB.put("redirect-mapping", JSON.stringify(mapping))
					return new Response("Ok", { status: 201 })
				}
				if (method === "DELETE") {
					const body = await request.json()
					const mapping = await getSafeRedirectMapping(env)
					delete mapping[body.name]
					await env.DB.put("redirect-mapping", JSON.stringify(mapping))
					return new Response("Ok")
				}
			}
			if (pathname === "/api/logout") return new Response("Ok", { headers: { "set-cookie": `${cookieName}=; Max-Age=0; Path=/` } })
			if (pathname === "/api/login") {
				const loginToken = request.headers.get("x-api-key")
				return await authOk(loginToken) ? new Response("Ok", { headers: { "set-cookie": `${cookieName}=${loginToken}; ${cookieAppendices}` } }) : new Response("Unauthorized", { status: 401 })
			}
		}

		// 3. 管理后台页面路由（带强鉴权保护）
		if (pathname === "/admin") {
			const token = getCookieToken()
			if (!await authOk(token)) {
				// 如果没有登录或者Token不匹配，重定向到登录页
				return Response.redirect(`${new URL(url).origin}/admin/login`, 302)
			}
			return new Response(adminHTML, { headers: { "content-type": "text/html" } })
		}
		
		if (pathname === "/admin/login") return new Response(adminLoginHTML, { headers: { "content-type": "text/html" } })
		
		// 4. 纯根路径 "/" 才显示首页
		if (pathname === "/") {
			return new Response(indexHTML, { headers: { "content-type": "text/html" } })
		}

		// 5. 带有后缀时（如 /123），核心处理短链重定向跳转
		const shortName = pathname.substring(1)
		if (shortName && isValidShortname(shortName)) {
			const mapping = await getSafeRedirectMapping(env)
			const targetUrl = mapping[shortName]
			
			if (targetUrl) {
				return Response.redirect(targetUrl, 302)
			}
		}

		// 6. 如果后缀不存在，兜底返回 404
		return new Response(notFoundHTML, { headers: { "content-type": "text/html" }, status: 404 })
	}
}