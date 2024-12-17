import { $canvas } from "@thi.ng/rdom-canvas";
import { fromRAF } from "@thi.ng/rstream";
import { circle, group } from "@thi.ng/geom";
import { defTimeStep } from "@thi.ng/timestep";
import { HashGrid2 } from "@thi.ng/geom-accel";
import { multiCosineGradient, srgb } from "@thi.ng/color";
import {
	alignment,
	Boid,
	cohesion,
	defBoid2,
	defFlock,
	separation,
	wrap2,
	type BoidOpts,
} from "@thi.ng/boids";
import { distSq2, randMinMax2, randNorm2 } from "@thi.ng/vectors";
import { repeatedly } from "@thi.ng/transducers";
import { weightedRandom } from "@thi.ng/random";
import type { Nullable } from "@thi.ng/api";

const W = 1280;
const H = 720;
const COUNT = 2000;
const PAD = 40;
const BMIN = [PAD, PAD];
const BMAX = [W - PAD, H - PAD];
const MAX_SPEED = 50;
const MAX_RADIUS = 50;

const ACCEL = new HashGrid2<Boid>((x) => x.pos.prev, 64, COUNT);

const OPTS: BoidOpts = {
	accel: ACCEL,
	maxSpeed: MAX_SPEED,
	constrain: wrap2(BMIN, BMAX),
	behaviors: [separation(40, 1.2), alignment(80, 0.5), cohesion(30, 0.8)],
};

export async function sketch() {
	const gradient = multiCosineGradient({
		num: MAX_RADIUS + 1,
		stops: [
			[0.2, [0.8, 1, 1, 0.01]],
			[0.5, [0, 0.5, 1, 0.01]],
			[0.8, [0.5, 0, 1, 0.01]],
			[1, [1, 0, 0.5, 0.01]],
		],
	});
	const sim = defTimeStep();
	const particles = defFlock(ACCEL, [
		...repeatedly(
			() =>
				defBoid2(
					randMinMax2([], BMIN, BMAX),
					randNorm2([], MAX_SPEED),
					{
						...OPTS,
						maxSpeed: weightedRandom([20, 50, 100], [1, 4, 2])(),
					}
				),
			COUNT
		),
	]);
	const scene = fromRAF({ timestamp: true }).map((t) => {
		sim.update(t, [particles]);
		return group(
			{},
			particles.boids.map((b) => {
				const p = b.pos.value;
				let radius = MAX_RADIUS;
				const neighbors = b.neighbors(radius, p);
				if (neighbors.length > 1) {
					let closest: Nullable<Boid> = null;
					let minD = Infinity;
					for (let n of neighbors) {
						if (n === b) continue;
						const d = distSq2(p, n.pos.value);
						if (d < minD) {
							minD = d;
							closest = n;
						}
					}
					if (closest) {
						radius = Math.sqrt(minD);
					}
				}
				return circle(b.pos.value, radius, {
					fill: gradient[Math.min(radius | 0, MAX_RADIUS)],
				});
			})
		);
	});
	$canvas(scene, [W, H], { id: "main" }).mount(
		document.getElementById("app")!
	);
}
