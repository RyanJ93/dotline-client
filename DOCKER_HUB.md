# DotLine client

DotLine is an instant messaging application with end-to-end encryption support out of the box built on top of Node.js and Apache Cassandra. <br />
DotLine supports several type of content, such as text messages, attachments, geo positions, voice messages, and stickers.  <br />
Most important DotLine features:

- End-to-end encryption support based on AES-256 and RSA.
- User account recovery support through secret recovery key.
- Supports text messages, attachments, geo positions, voice messages, and stickers (static and animated).
- Discrete with a very low privacy footprint and access tracking for additional account security.

Disclaimer: I made this as part of my graduation project, for that reason this piece of software is provided "as is" and without any sort of warranty or guarantee for future updates. <br />
If you feel a little curious you can [try out DotLine here](https://dotline.enricosola.dev).

## Quick reference

- Project GitHub repository: [https://github.com/RyanJ93/dotline-client](https://github.com/RyanJ93/dotline-client)
- DotLine server image: [https://hub.docker.com/r/enricosola/dotline-server](https://hub.docker.com/r/enricosola/dotline-server)
- DotLine server GitHub repository: [https://github.com/RyanJ93/dotline-server](https://github.com/RyanJ93/dotline-server)

## How to use this image

To run your own instance of the DotLine server issue the following command:

````bash
docker run -p 8080:80 -d --name dotline-client enricosola/dotline-client:latest
````

### Customizing configuration path

You must define a volume bound to the directory where the configuration file is stored; please mind that inside that folder the configuration file must be named config.json.
You can provide a configuration folder location using this option: `[config path]:/home/dotline-client/config`.

Mind that this image has been built on top of the NGINX Docker image, for any additional configuration please refer to the [official NGINX Docker image documentation](https://hub.docker.com/_/nginx) available on Docker hub.

## License

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

Developed with ❤️ by [Enrico Sola](https://www.enricosola.dev).
