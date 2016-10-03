#Lightning Fast(ly) Deployment

## Ember-cli-deploy-fastly

NOTE: This is currently just a skeleton and doesn't actually do anything yet.

> An ember-cli-deploy plugin to upload index.html to a Redis store

This plugin uploads index.html to a [Fastly Edge Dictionary][1].

This is based on a modified form of Ember Lightning Deployment first presented
by James Rosen at [Fastly][2]

This method requires custom VCL for Fastly and exploits Varnish synthetics.

You'll need to know about [Fastly VCL][3]. Assuming you know what you're doing,
modify your ```sub vcl_recv``` to look like the following:

```
sub vcl_recv {
  unset req.http.X-App-Content;
  if (req.url.path == "/" ||
    req.url.path == "index.html") {

    set req.http.X-App-Content =
      table.lookup(appAssets,
        "index.html");

    error 900 "index";
  }


#FASTLY recv

  if (req.request != "HEAD" && req.request != "GET" && req.request != "FASTLYPURGE") {
    return(pass);
  }

  return(lookup);
}
```

This requires you to have an Edge Dictionary called ```appAssets``` -- you can
change this to whatever you want. The name appAssets isn't critical, just be
sure that the dictionary you call in the VCL has the same name as the dictionary (obviously!)

You'll then need to modify your ```sub vcl_error``` to look like this:

```
sub vcl_error {
  if (obj.status == 900) {
    set obj.status = 200;
    set obj.response = "OK";
    synthetic req.http.X-App-Content;
    return(deliver);
  }

#FASTLY error
}
```

## How is this different than Lightning Deploy with Redis?

Speed. You're essentially storing your index.html in Varnish while your assets
live in S3. This means that your Ember app will probably be the fastest Ember app
on the planet.

# Contributors Wanted!

I'm working on this on the side and there's a long ways to go before this is useable.
Currently, I'm using ember-cli-deploy to get my assets to S3 and manually updating
my edge dictionary via CURL. That's a horrible experience, hence the attempt at
a plugin.


[1]: https://docs.fastly.com/guides/edge-dictionaries/about-edge-dictionaries
[2]: https://fastly.com
[3]: https://docs.fastly.com/guides/vcl/mixing-and-matching-fastly-vcl-with-custom-vcl