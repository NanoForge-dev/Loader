---
outline: deep

prev:
  text: Introduction
  link: '/api'
---

# Manifest

The loader server implement a `manifest` to allow each client to know a bunch of information like current version of the game, or the path to each asset.

Here is an example of a manifest :
```shell
curl -X GET "<LOADER_SERVER_HOST>/manifest"
```
```json
{
  "version": "1.0.0",
  "files": {
    "assets": [
      {
        "path": "/path/to/asset"
      }
    ],
    "scripts": [
      {
        "path": "/path/to/script"
      }
    ]
  }
}
```
