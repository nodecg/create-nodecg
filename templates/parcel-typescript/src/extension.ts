import type NodeCG from "nodecg/types";

export default (nodecg: NodeCG.ServerAPI) => {
	nodecg.log.info("Hello, world!");

	nodecg.listenFor("hello", (data, ack) => {
		nodecg.log.info("Received hello message:", data);
		if (ack && !ack.handled) {
			ack("Hello, back!");
		}
	});
};
