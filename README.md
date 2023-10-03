# Cards Against Boredom

Fully dockerized, mobile-freindly and open-source digital cards game inspired by [Cards Against Humanity](https://www.cardsagainsthumanity.com/).

Set it up on your own servers to play with your friends and colleagues with your own set of cards. Feel free to modify everything in this project to make it your own!

## Docker Setup

First, copy and modify the environment variables:

```
cp .env.template .env
```

Set some arbitrary values for each vor the variables in `.env` (`SECRET` must be fairly long).

Then run the Docker Compose Stack with

```
docker compose up --build
```

Voilà! You will have a server up and running at `localhost:5000`. Modify `docker-compose.yaml` to change the port.

## Game Setup

Navigate to `http://localhost:5000/admin`. There, you can enter an arbitrary name and the password you have set under `ADMIN_PW` in `.env`. After logging in as an admin, you can enter cards and questions to your liking, which will be persistently saved in MongoDB.

After your players have entered the lobby via choosing a name on the landing page, you can start the game via the admin menu. As you surely want to participate in the game yourself, you can open the landing page in a different tab.

Enjoy playing!

## Presenters Mode

...

## Demo

[https://cab.varzival.eu/](https://cab.varzival.eu/)

An admin will need to start the game to play it properly. But you can still enjoy the slick landing page animation!

## Futher Development

- add more detailed instructions about how to start frontend & backend in development mode
- add English localization
- ...
