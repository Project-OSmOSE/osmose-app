# aplose-frontend

See [global README file](../README.md) and [React + Vite-related documentation](../docs/react.md) for more documentation.

For more information about what the application can do or how to use the annotator, see the [user guide](../docs/user_guide_annotator.md).

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Libraries

- [react-router-dom](https://v5.reactrouter.com/) - v5.3.4

For now (in november 2023, when migrating project from `create-react-app` to `ViteJS`), `react-router-dom` has been kept on "classic" version (5.x). Latest version (6.x) contains several breaking changes that needs some work.

```bash
npm install react-router-dom@^5
npm install --save-dev @types/react-router-dom@^5
```

- [boostrap](https://getbootstrap.com/) - v5.3.2

Bootstrap is used to easily improve the application design, and to allow developers who are not comfortable with CSS to easily contribute.

```bash
npm install bootstrap
```

Then, it must be imported into the application css:

```css
/* globals.css */
@import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
```

- [react-boostrap](https://react-bootstrap.netlify.app/) - v2.9.1

```bash
npm install react-bootstrap
```

- [react-confirm](https://github.com/haradakunihiko/react-confirm) - v0.3.0

```bash
npm install react-confirm
```

- [superagent](https://github.com/ladjs/superagent) - v8.1.2

```bash
npm install superagent
npm install --save-dev @types/superagent
```

- [uuid](https://github.com/uuidjs/uuid) - v9.0.1

```bash
npm install uuid
npm install --save-dev @types/uuid
```

## Inspired by CrowdCurio

This project started as a wrapper around [CrowdCurio annotator](https://github.com/CrowdCurio/audio-annotator). As our use case diverged we decided to restart from scratch, using CrowdCurio as inspiration. Some features are still missing: waveform representation of the audio file, [user feedback](https://github.com/CrowdCurio/audio-annotator#feedback-mechanisms) through test audio files (that already has reference annotations), and advanced tracking of user actions (deleted_annotations and annotation_events: `start-to-create`, `offline-create`, `add-annoation-label`, `add-proxity-label`, `delete`, `play-region`, `select-for-edit`, `region-moved-end`, `region-moved-start`).
