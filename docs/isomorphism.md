# Isomorphism (SSR)

The application is designed to be first rendered by the backend,
then in a second time hydrated on browser runtime.

There's 3 group/category of service side rendering (SSR) available on the application.

## Document rendering

The document (html entrypoint for the application) is rendered on demand.
By doing so, we may push inside the proper JS scripts and/or CSS stylesheets to apply.

In additions of this, the main strength to render it on the server side is to provide the capability to push extra
information such as runtime configuration.

You may look into `src/server/Document.tsx` to see the React component on which the feature is based.

## Templating

The whole application does not use templating library per says ;
Instead we rely on React components and render those to markup (html).
The main example of this would be emails.

## Isomorphism

We call an application isomorphic when it has the capability to run both on server and browser.
The main point of this is to improve the response time for the user as well as SSO.
When the user fetch a page, it will be first rendered by the server and served,
after what the JS scripts will be loaded then executed.

Isomorphism brings limitations, such as a very good understanding of the differences between browser and node contexts.
But it also requires the server to be able to render exactly the same output as a browser would.

It's very difficult to be added on a huge existing code base, this is why this feature is included by default.
To remove it read the following section.
