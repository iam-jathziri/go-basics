package main

import (
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/static"
)

func main() {
	app := fiber.New()

	app.Get("/api/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// En dev, el frontend corre aparte con `npm run dev` (Vite, puerto 5173)
	// y su proxy reenvía /api aquí. Esto solo sirve el build de producción
	// generado por `npm run build` (frontend/dist).
	//
	// NotFoundHandler cae siempre a index.html: como Vue Router usa modo
	// "history", rutas como /login o /pueblo/5 no existen como archivos
	// en dist/, y sin este fallback el navegador recibiría un 404 al
	// entrar directo o refrescar en esas URLs.
	app.Use("/", static.New("./frontend/dist", static.Config{
		NotFoundHandler: func(c fiber.Ctx) error {
			return c.Status(fiber.StatusOK).SendFile("./frontend/dist/index.html")
		},
	}))

	log.Fatal(app.Listen(":8080"))
}
