# Hot Reload

Hot Reload is available when running the application in development mode with the following command :

```bash
yarn dev
```

It will :

-   Compile and serve the web application
-   Compile the server code and start both the web server and a worker

The web application is build with [Webpack Hot Module Replacement][webpack-hmr] (HMR) and served with [webpack-hot-middleware].
In additions of that [react-refresh] is being used to provide more suitable replacement on changes for React.
Any changes of code should automatically refresh the web application in browsers.
It may happen due to state management in React, you may in some situations prefer to refresh the page yourself to
avoid weird behavior or state.

[react-refresh]: https://www.npmjs.com/package/react-refresh
[webpack-hmr]: https://webpack.js.org/concepts/hot-module-replacement/
[webpack-hot-middleware]: https://www.npmjs.com/package/webpack-hot-middleware

However the backend (web server & worker) does not rely on HMR for updates :
the whole application will be stopped and restarted on the newest built code.

The idea is similar to the way `nodemon` is working but at a lower level.
The restart happens inside the same NodeJS thread as the one owning webpack compiler.
Upon newly build, it will call cleanup methods (especially for worker to properly stop processing jobs)
then import the build bundle for the server once again.
After what it will recreate the web server and restart a worker.

Some singletons have been set in places to avoid leaking connections ;
that applies for Redis connections and MongoDB connections.
