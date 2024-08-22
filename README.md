# Toaru VTT

Toaru is a Virtual Tabletop (VTT) specializing in card-heavy tabletop games that
demand a flexible table layout, such as: [*The Quiet
Year*](https://buriedwithoutceremony.com/the-quiet-year), [*i'm sorry did you
say street magic*](https://seaexcursion.itch.io/street-magic), or
[*Dialect*](https://thornygames.com/pages/dialect).

## Motivation

There are a lot of virtual tabletops, and a lot of them spend great effort
implementing several complex game-specific mechanics. This works great for games
with the budget or playerbase to have assets custom-built for it, but there are
lots of great tabletop games that really demand little more than a canvas and
some standard materials. In the words of a friend:

> ...Could I just have a dicebot attatched to a virtual whiteboard?

This project is an attempt to make a dicebot attached to a virtual whiteboard.
With cards.

## Contributing

Contributions are welcome!

### Development

The easiest way to get started is by deploying the app, which only depends on
`make` and Docker Compose. Once deployed, the site will be available on port
`8080`.

```bash
$ make deploy
...
 ✔ Container toaru-vtt-frontend-1  Started
 ✔ Container toaru-vtt-redis-1     Started
 ✔ Container toaru-vtt-backend-1   Started
```

If you're doing local development, things get a little more sophisticated:
- For the backend you need a recent version of Go (currently 1.22)
- For the frontend you need a recent version of Node (currently 20.17) with Yarn installed
- We'll still need docker to serve dependency services

The main commands are still available via `make`:

```bash
$ make dev # Start up a dev environment on port 8080
$ make test # Run unit tests
```
