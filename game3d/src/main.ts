import { startGame } from "./app.ts";
import "./ui/styles.css";

const app = await startGame(document.querySelector<HTMLElement>("#app")!);
import.meta.hot?.dispose(() => app.dispose());
