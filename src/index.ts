import { $addChild, $compile } from "@thi.ng/rdom";
import { sketch, label } from "./2024/05-vera";
import { div, h1 } from "@thi.ng/hiccup-html";

document.title = label;

$compile(div({ id: "label" }, h1({}, label))).mount(
	document.getElementById("container")!,
	0
);
await sketch();
