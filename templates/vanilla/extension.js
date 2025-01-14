module.exports = (nodecg) => {
	nodecg.listenFor("hello", () => {
		console.log("Hello from the bundle!");
	});
};
