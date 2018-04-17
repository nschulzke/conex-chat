source .env
npx knex migrate:latest
killall nodejs
nodejs server &
