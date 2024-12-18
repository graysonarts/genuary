import { columns2d } from "@thi.ng/grid-iterators";
import { W, H } from "../common";
import { $canvas } from "@thi.ng/rdom-canvas";
import { fromRAF } from "@thi.ng/rstream";
import { circle, group, rect, vertices } from "@thi.ng/geom";
import { setAlpha, srgb } from "@thi.ng/color";
import { defHatchPen, defLine, fuzzyPoly } from "@thi.ng/geom-fuzz";

export const label = "2024 Jan 05 - Vera Molnár";
const GRID_SIZE = 100;
const X_OFFSET = 190;
const Y_OFFSET = 60;
const drawCount = 10;

export async function sketch() {
	const pen = defHatchPen([0, 0.8, 1, 0.1]);
	const grid = columns2d({ cols: 9, rows: 6 });
	const drawing = [...grid].flatMap(([x, y], idx) => {
		return [...new Array(drawCount).keys()].map((_t) =>
			fuzzyPoly(
				vertices(
					rect(
						[x * GRID_SIZE + X_OFFSET, y * GRID_SIZE + Y_OFFSET],
						[GRID_SIZE, GRID_SIZE]
					)
				),
				{},
				{
					curve: { scale: 0.5 },
					// fill: pen,
					jitter: x + 2 + y,
				}
			)
		);
	});
	const scene = fromRAF({ timestamp: true }).map((t) => {
		return group(
			{
				__background: "#e5e4e2",
				stroke: "rgba(179, 48, 34, 1.0)",
			},
			drawing
		);
	});

	$canvas(scene, [W, H], { id: "main" }).mount(
		document.getElementById("app")!
	);
}
