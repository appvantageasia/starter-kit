## Serve the assets over CDN

By default the server will serve the assets on the public path `/public/`.
However you may override the public path by using the environment settings.

The server only allows serving from `/public/`, but you may move the asset to a CDN instead.
the server will properly apply the public path and include the CDN hostname in the content security policy.


## Remove SSR support

To remove the isomorphic app you are simply required to update two files ;

First update the rendering function on the server side, which should be in `src/server/renderApplication.tsx`.
You should keep the document rendering, however you may remove the generation of the HTML injected into the React container.

The second file to update is the entrypoint for the web application, which should be `src/app/index.tsx`.
You simply need to replace `hydrate` by `render`.

You may also update styled component settings to disable SSR support.

## Build multiple web applications

You may add additional bundles to be built as web applications.
To do so you need to open the file `devtools/webpack/index.js` in which you should fine a webpack configuration
under the variable `appConfig`. Update the configuration as below :

```javascript
const appConfig = {
    /* config... */

    entry: {
        app: [
            /* entry points for app bundle */
        ],
        // add a new bunblde to be built
        otherApp: [
            // list entry points for this new bundle
            path.resolve(srcDirname, 'app/otherApp.tsx'),
        ],
    },

    /* config... */
};
```

After restarting your webpack (build) you should now see it bundling a second entry point for your second application.
You may add as many bundles as you require.
