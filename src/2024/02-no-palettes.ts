import { hilbert2d } from "@thi.ng/grid-iterators";
import { W, H } from "../common";
import { $canvas } from "@thi.ng/rdom-canvas";
import { fromRAF } from "@thi.ng/rstream";
import { circle, group, rect } from "@thi.ng/geom";
import { srgb } from "@thi.ng/color";

export const label = "2024 Jan 02 -  No Palettes";

const GRID_SIZE = 128;
const CELL_WIDTH = W / GRID_SIZE;
const CELL_HEIGHT = H / GRID_SIZE;

export async function sketch() {
	const grid = hilbert2d({ cols: GRID_SIZE, rows: GRID_SIZE });
	const points = [...grid].map(([x, y], idx) => {
		return {
			x: x * CELL_WIDTH,
			y: y * CELL_HEIGHT,
			x_f: Math.abs(Math.cos((x / GRID_SIZE) * Math.PI * 2.0)),
			y_f: Math.abs(Math.cos((y / GRID_SIZE) * 2.0 * Math.PI)),
			z_f: Math.abs(
				Math.sin((idx / (GRID_SIZE * GRID_SIZE)) * 2.0 * Math.PI)
			),
		};
	});

	const scene = fromRAF({ timestamp: true }).map((t) => {
		return group(
			{},
			points.map((p) => {
				return rect([p.x, p.y], [CELL_WIDTH, CELL_HEIGHT], {
					fill: srgb(
						p.x_f / p.z_f,
						p.y_f / p.z_f,
						Math.abs(Math.cos((t * p.z_f) / 1000))
					),
				});
			})
		);
	});

	$canvas(scene, [W, H], { id: "main" }).mount(
		document.getElementById("app")!
	);
}
