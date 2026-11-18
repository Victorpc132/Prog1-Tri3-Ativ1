import login from "./index.html"
import home from "./home.html"
import grupo from "./grupo.html"
import { db } from "./db"

const sessoes: any = {}

function usuarioLogado(req: any) {
    const codigo = req.cookies.get("ses")
    if (!codigo) return null
    return sessoes[codigo] || null
}

function erro(msg: string, status: number) {
    return Response.json({ msg: msg }, { status: status })
}

const srv = Bun.serve({
    port: 3000,
    routes: {

        "/": login,
        "/home": home,
        "/grupo": grupo,

        "/api/cadastro": {
            POST: async (req) => {
                const body: any = await req.json()

                if (!body.username || !body.email || !body.password) {
                    return erro("preencha tudo", 400)
                }

                const hash = await Bun.password.hash(body.password)

                try {
                    db.query("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)")
                        .run(body.username, body.email, hash)
                } catch (e) {
                    return erro("usuario ou email ja existe", 409)
                }

                return Response.json({ ok: true })
            }
        },

        "/api/login": {
            POST: async (req) => {
                const body: any = await req.json()

                const usuario: any = db.query("SELECT * FROM users WHERE username = ?")
                    .get(body.username)

                if (!usuario) {
                    return erro("usuario nao encontrado", 404)
                }

                const senhaCerta = await Bun.password.verify(body.password, usuario.password_hash)
                if (!senhaCerta) {
                    return erro("senha incorreta", 401)
                }

                const codigo = crypto.randomUUID()
                sessoes[codigo] = { id: usuario.id, username: usuario.username }

                req.cookies.set("ses", codigo)

                return Response.json({ ok: true })
            }
        },

        "/api/logout": {
            POST: async (req) => {
                const codigo = req.cookies.get("ses")
                if (codigo) {
                    delete sessoes[codigo]
                }
                req.cookies.delete("ses")
                return Response.json({ ok: true })
            }
        },

        "/api/eu": {
            GET: (req) => {
                const eu = usuarioLogado(req)
                if (!eu) return erro("nao logado", 401)
                return Response.json({ id: eu.id, username: eu.username })
            }
        }
    }
})

console.log(`Servidor rodando em ${srv.url}`)
