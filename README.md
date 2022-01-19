# NDLS Booking Checker (Ireland)

This repo contains code for a command line tool that will repeatedly check for new slots available at a specific NDLS centre and notify the user if any are found.

### Installation

To install this tool, Node.js with Yarn or `npm` is required. On your command line, execute:

```sh
~ $ git clone https://github.com/adriancooney/ndls-booking.git
~ $ cd ndls-booking
ndls-booking $ yarn
```

### Setup

Your login details are required for the tool to run. Duplicate the `config/local.example.json` configuration file, rename it to `local.json` and fill in your details.

```sh
ndls-booking $ cp config/local.example.json config/local.json
ndls-booking $ nano config/local.json
```

### Run

Execute `yarn ndls slots <centre name>` with your specific centre.

```sh
ndls-booking $ yarn ndls slots leopardstown
yarn run v1.22.17
$ yarn ts-node lib/ndls/bin/ndls.ts slots leopardstown
$ /Users/adrian/Code/ndls-booking/node_modules/.bin/ts-node lib/ndls/bin/ndls.ts slots leopardstown
>>> Checking slots for centre: Leopardstown, Dublin
> 01-25-2022: 36 slots
> 01-26-2022: 51 slots
> 01-27-2022: 72 slots
> 01-28-2022: 63 slots
> 01-29-2022: 3 slots
> 01-31-2022: 33 slots
> 02-01-2022: 37 slots
> 02-02-2022: 39 slots
> 02-03-2022: 37 slots
> 02-04-2022: 38 slots
> 02-05-2022: 27 slots
> 02-07-2022: 144 slots
> 02-08-2022: 182 slots
> 02-09-2022: 182 slots
> 02-10-2022: 185 slots
> 02-11-2022: 180 slots
> 02-14-2022: 194 slots
> 02-15-2022: 194 slots
> 02-16-2022: 194 slots
> 02-17-2022: 193 slots
> 02-18-2022: 193 slots
> 02-19-2022: 68 slots
>>> Checking slots for centre: Leopardstown, Dublin
>>> 0 new slots found
>>> Checking slots for centre: Leopardstown, Dublin
>>> 0 new slots found
>>> Checking slots for centre: Leopardstown, Dublin
>>> 0 new slots found
>>> Checking slots for centre: Leopardstown, Dublin
>>> 0 new slots found
>>> Checking slots for centre: Leopardstown, Dublin
>>> 2 new slots found
> 01-19-2022: 1 slots
> 01-31-2022: 1 slots
```

### Help

```
yarn run v1.22.17
$ yarn ts-node lib/ndls/bin/ndls.ts --help
$ /Users/adrian/Code/ndls-booking/node_modules/.bin/ts-node lib/ndls/bin/ndls.ts --help
Usage: ndls [options] [command]

Options:
  -h, --help           display help for command

Commands:
  slots <centre name>
  help [command]       display help for command
✨  Done in 1.38s.
```
