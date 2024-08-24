
BUILD_FROM_TS?=0

dev:
	docker compose kill || true
	docker compose rm || true
	docker rm -f sermas-toolkit-api-kiosk-1 || true
	BUILD_FROM_TS=${BUILD_FROM_TS} docker compose up -d
	docker restart sermas-toolkit-api-proxy-1
	docker compose logs -f

clean:
	docker compose exec -it kiosk rm app/.svelte-kit/ -rf 
	docker compose exec -it kiosk rm app/node_modules/.vite/ -rf
