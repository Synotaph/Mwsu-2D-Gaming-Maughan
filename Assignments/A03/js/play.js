var play = {
	create: function () {
		console.log("play.js");
		// Game width and height for convenience
		w = game.width
		h = game.height

		frame_counter = 0

		// Bg color
		game.stage.backgroundColor = BG_COLOR
		// Bg image
		this.bg = game.add.image(0, 0, 'bg')

		// Platform width
		platform_width = game.cache.getImage('obstacle').width

		// Score sound
		this.sound.score = game.add.audio('score')
		this.sound.score.volume = .4

		// Death sound
		this.sound.kill = game.add.audio('kill')

		// Music
		this.music = game.add.audio('music')
		this.music.play('', 0, 0.5, true)

		this.physics.startSystem(Phaser.Physics.ARCADE)

		// Obstacles
		this.obstacles = game.add.group()

		// Player
		this.player = game.add.sprite(game.width / 2, 250, 'player')
		game.physics.enable(this.player, Phaser.Physics.ARCADE)
		this.player.enableBody = true
		this.player.body.collideWorldBounds = true
		this.player.scale.setTo(.5, .5)
		this.player.anchor.setTo(.5, .5)
		this.player.body.setSize(this.player.width - 10, this.player.height)

		// Score label
		this.bmpText = game.add.bitmapText(game.width / 2, 100, 'fontUsed', '', 150);
		this.bmpText.anchor.setTo(.5, .5)
		this.bmpText.scale.setTo(.3, .3)

		// Support for mouse click and touchscreen input
		game.input.onDown.add(this.onDown, this)

		this.pauseAndUnpause(game)
	},

	update: function () {
		this.bmpText.text = game.global.score

		// Collision
		game.physics.arcade.overlap(this.player, this.obstacles, this.killPlayer, null, this)

		// Spawn enemies

		if (frame_counter % 90 == 0) 
		{
			var spawnPoint = Math.random() * (w)
			var randomSpeed = (Math.random() * 150) + 50
			this.spawnObstacle(game.global.obstacle_id++, spawnPoint, game.height, speed = randomSpeed, has_given_point = false)
		}

		this.move();

		frame_counter++
		if (frame_counter % 2 == 0)
		{
			game.global.score += this.scorePoint();
		}
	},

	spawnObstacle: function (entity, x, y, speed, has_given_point) 
	{
		var platform_picker = Math.random() * 5
		if (platform_picker < 1)
		{
			var obstacle = this.obstacles.create(x, y, 'obstacle1', entity)
		}
		else if (platform_picker < 2)
		{
			var obstacle = this.obstacles.create(x, y, 'obstacle2', entity)
		}
		else if (platform_picker < 3)
		{
			var obstacle = this.obstacles.create(x, y, 'obstacle3', entity)
		}
		else if (platform_picker < 4)
		{
			var obstacle = this.obstacles.create(x, y, 'obstacle4', entity)
		}
		else
		{
			var obstacle = this.obstacles.create(x, y, 'obstacle5', entity)
		}

		game.physics.enable(obstacle, Phaser.Physics.ARCADE)

		obstacle.enableBody = true
		obstacle.body.colliderWorldBounds = true
		obstacle.body.immovable = true
		obstacle.anchor.setTo(.5, .5)
		obstacle.scale.setTo(.5, .125)
		obstacle.body.velocity.y = -speed
		obstacle.has_given_point = has_given_point

		obstacle.checkWorldBounds = true;
		// Kill obstacle/enemy if vertically out of bounds
		obstacle.events.onOutOfBounds.add(this.killObstacle, this);

		obstacle.outOfBoundsKill = true;
		console.log(this.obstacles);
	},

	killObstacle: function (obstacle) {
		console.log(obstacle);
		this.obstacles.remove(obstacle);
		console.log(this.obstacles.children.length);
	},

	scorePoint: function () {
		//console.log(this.obstacles)
		var point = 0;
		var obstacles = this.obstacles.children;

		for (var i = 0; i < obstacles.length; i++) {
			if (obstacles[i].visible) {
				// console.log("vis: ")
				// console.log(obstacles[i].y,this.player.y);
				let py = this.player.y;
				let oy = obstacles[i].y;
				let ox = obstacles[i].x;

				//if player is below obstacle and within 5 pixels they score a point
				if (py > oy && Math.abs(py - oy) < 5) {
					point++;
					this.sound.score.play('', 0, 0.5, false)
				}
			}
		}
		return point;
	},

	killPlayer: function (player) {

		//issues with this
		//game.plugins.screenShake.shake(20);
		this.sound.kill.play('', 0, 0.5, false)
		player.kill();
		game.state.start('gameOver');

	},


	// Tap on touchscreen or click with mouse
	onDown: function (pointer) {},

	// Move player
	move: function () {
		if (game.input.activePointer.isDown) {
			//console.log(game.input.x);
			let rate = this.moveSpeed(game.input.x, game.width);
			let angle = this.moveAngle(rate, 3);
			//console.log("rate: " + rate);
			this.player.x += rate;
			this.player.angle = angle;
		} else {
			this.player.angle = 0;
		}
	},
	moveAngle: function (rate, factor) {

		return rate * factor;
	},

	moveSpeed: function (x, width, skill = 2) {
		var ratio = 0;

		if (x < width / 2) {
			ratio = x / (width / 2);
			ratio *= 10;
			ratio = Math.ceil(ratio);
			ratio /= 2;
			rate = (5 - ratio) * -1;
		} else {
			ratio = x / width;
			ratio *= 10;
			ratio = Math.ceil(ratio);
			ratio /= 2;
			rate = ratio;
		}
		console.log(rate * skill);
		return rate * skill;
	},

	pauseAndUnpause: function (game) {
		var pause_button = game.add.sprite(game.width - 40, 40, 'pause')
		pause_button.anchor.setTo(.5, .5)
		pause_button.inputEnabled = true
		// pause:
		pause_button.events.onInputUp.add(
			function () {
				if (!game.paused) {
					game.paused = true
				}
				pause_watermark = game.add.sprite(game.width / 2, game.height / 2, 'pause')
				pause_watermark.anchor.setTo(.5, .5)
				pause_watermark.alpha = .1
			}, this)
		// Unpause:
		game.input.onDown.add(
			function () {
				if (game.paused) {
					game.paused = false
					pause_watermark.destroy()
				}
			}, self)
	},

	render: function () {
		debug = false
		if (debug) {
			// Show hitbox
			game.debug.body(this.player)

			for (var i = 0; i < obstacles.length; i++) {
				game.debug.body(obstacles[i])
			}
		}
	}
}