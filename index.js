/**
 * @typedef {object} Options
 * @prop {string} name
 * @prop {Function} callback
 */

class BetterConsole {
	/**
	 *
	 * @param {object} opts
	 * @param {Options[]} [opts.options] - Array of options
	 * @param {string} [opts.question]	- Question to ask the user
	 */
	constructor(opts = {}) {
		this.setQuestion(opts.question || 'Please choose an option:');
		if (opts.options) this.setOptions(opts.options);
		this.currentSelection = 0;

		process.on('SIGINT', BetterConsole.handleSIGINT);
	}

	renderMenu() {
		console.clear();
		console.log(this.question);
		this.options.forEach((option, index) => {
			if (index === this.currentSelection) {
				console.log(`> ${option.name}`);
			} else {
				console.log(`  ${option.name}`);
			}
		});
	}

	/**
	 *
	 * @param {Options[]} options - Array of options
	 */
	setOptions(options) {
		if (!options) {
			throw new Error('Options not provided');
		} else if (!Array.isArray(options)) {
			throw new Error('Options must be an array');
		} else if (options.length === 0) {
			throw new Error('Options array must not be empty');
		} else if (!options.every((option) => option.name && option.callback)) {
			throw new Error(
				'Options array must have name and callback properties'
			);
		}
		this.options = options;

		this.options.push({
			name: 'Exit',
			callback: BetterConsole.handleSIGINT,
		});
	}

	/**
	 *
	 * @param {string} question - Question to ask the user
	 */
	setQuestion(question) {
		if (typeof question !== 'string') {
			throw new Error('Question must be a string');
		} else if (question.length === 0) {
			throw new Error('Question must not be empty');
		}
		this.question = question;
	}

	handleInput(data) {
		const key = data.toString();

		if (key === '\u001B[A') {
			// Up arrow key
			if (this.currentSelection > 0) {
				this.currentSelection--;
				this.renderMenu();
			}
		} else if (key === '\u001B[B') {
			// Down arrow key
			if (this.currentSelection < this.options.length - 1) {
				this.currentSelection++;
				this.renderMenu();
			}
		} else if (key === '\u000D') {
			// Enter key
			process.stdin.setRawMode(false);
			process.stdin.pause();
			this.handleSelection();
		} else if (key === '\u0003') {
			// Ctrl+C (SIGINT)
			BetterConsole.handleSIGINT();
		}
	}

	handleSelection() {
		this.stop();
		this.options[this.currentSelection].callback();
	}

	static handleSIGINT() {
		process.stdin.setRawMode(false);
		process.stdin.pause();
		console.log('\nGoodbye!');
		process.exit(0);
	}

	stop() {
		process.stdin.setRawMode(false);
		process.stdin.pause();
	}

	resume() {
		this.currentSelection = 0;
		this.renderMenu();
		process.stdin.setRawMode(true);
		process.stdin.resume();
	}

	start() {
		if (!this.options || this.options.length === 0) {
			throw new Error('Options not set');
		}
		this.renderMenu();
		process.stdin.setRawMode(true);
		process.stdin.resume();
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', this.handleInput.bind(this));
	}
}

module.exports = BetterConsole;
