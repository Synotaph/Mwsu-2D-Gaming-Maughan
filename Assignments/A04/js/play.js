var play = {
	create: function () {
		console.log("play.js");
		// Game width and height for convenience
		w = game.width
		h = game.height
		leftRate = 0		// how fast to move left when pressing left arrow key
		rightRate = 0
		firerate = 1
		frame_counter = 0

		// Bg color
		game.stage.backgroundColor = BG_COLOR
		// Bg image
		this.bg = game.add.image(0, 0, 'bg')

		// Score sound
		this.sound.score = game.add.audio('score')
		this.sound.score.volume = .4

		// Death sound
		this.sound.kill = game.add.audio('kill')
		this.sound.boom = game.add.audio('boom')

		// Music
		this.music = game.add.audio('music')
		this.music.play('', 0, 0.5, true)

		this.physics.startSystem(Phaser.Physics.ARCADE)

		// Obstacles
		this.obstacles = game.add.group()

		// Players
		this.player = game.add.sprite(game.width / 4, 250, 'player')
		game.physics.enable(this.player, Phaser.Physics.ARCADE)
		this.player.enableBody = true
		this.player.body.collideWorldBounds = true
		this.player.scale.setTo(.25, .25)
		this.player.anchor.setTo(.5, .5)
		this.player.body.setSize(this.player.width - 10, this.player.height)

		// Bombs
		this.bombs = game.add.group();
		// To move the sprites later on, we have to enable the body
        this.bombs.enableBody = true;
	    // We're going to set the body type to the ARCADE physics, since we don't need any advanced physics
        this.bombs.physicsBodyType = Phaser.Physics.ARCADE;
        this.bombs.createMultiple(10, 'bomb');
        this.bombs.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetbomb);
        this.bombs.callAll('anchor.setTo', 'anchor', 0.5, 1);
        this.bombs.callAll('scale.setTo', 'scale', 0.25, 0.25);
        this.bombs.callAll('body.setSize', 'body', .5, .5);
        this.bombs.setAll('checkWorldBounds', true);

		//  An explosion pool that gets attached to each icon
		this.explosions = game.add.group();
		this.explosions.createMultiple(10, 'explosion');
		this.explosions.forEach(this.setupObstacles, this);

		// Score label
		this.bmpText = game.add.bitmapText(game.width / 2, 100, 'fontUsed', '', 150);
		this.bmpText.anchor.setTo(.5, .5)
		this.bmpText.scale.setTo(.3, .3)

		// Support for mouse click and touchscreen input
		game.input.onDown.add(this.onDown, this)
		this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
		this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
		this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

		this.pauseAndUnpause(game)
	},

	update: function () {
		this.bmpText.text = game.global.score

		// Collision
		game.physics.arcade.overlap(this.player, this.obstacles, this.killPlayer, null, this)
		game.physics.arcade.overlap(this.bombs, this.obstacles, this.destroyItem, null, this)

		// Spawn enemies

		if (frame_counter % 90 == 0) 
		{
			var spawnPoint = Math.random() * (w)
			var randomSpeed = (Math.random() * 150) + 50
			this.spawnObstacle(game.global.obstacle_id++, spawnPoint, game.height, speed = randomSpeed, has_given_point = false)
		}

		if (this.leftKey.isDown)
		{
			leftRate++;  // increase left rate as long as key is pressed
			this.keyMove(-1,leftRate);
		}
		else
		{
			leftRate=0; // key released
		}

		if (this.rightKey.isDown)
		{
			rightRate++;  // increase left rate as long as key is pressed
			this.keyMove(1,rightRate);
		}
		else
		{
			rightRate=0; // key released
		}

		if (this.downKey.isDown)
		{
			firerate++;
			if (firerate % 3 == 0)
			{
				this.fireBombs();
			}
		}
		else
		{
			firerate = 1;
		}

		this.move();

		frame_counter++
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

	killPlayer: function (player) 
	{
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
		if (game.input.activePointer.isDown) 
			{//console.log(game.input.x);
			let rate = this.moveSpeed(game.input.x, game.width);
			let angle = this.moveAngle(rate, 3);
			//console.log("rate: " + rate);
			this.player.x += rate;
			this.player.angle = angle;
			}
		else {
			this.player.angle = 0;
		}
	},

	keyMove: function (direction=0,rate=0) {
        //console.log(game.input.x);
        var angle = 0;
        if(direction == 0 && rate==0){
            rate = this.moveSpeed(game.input.x, game.width);
        }else{
            rate = Math.floor(rate / 3) * direction;
        }
        
        angle = this.moveAngle(rate, 3); 
        

        this.player.x += rate;
        this.player.angle = angle;
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

	fireBombs: function() 
	{
		var bullet = this.bombs.getFirstExists(false);
        if (bullet) 
		{
            // If we have a bomb, set it to the starting position
            bullet.reset(this.player.x, this.player.y + 20);
            // Give it a velocity of -500 so it starts shooting
            bullet.body.velocity.y = 500;
		}
    },

	resetbomb: function(bomb) 
	{
        // Destroy the laser
        bomb.kill();
    },

	setupObstacles: function (obstacle) 
	{

		obstacle.anchor.x = 0.5;
		obstacle.anchor.y = 0.5;
		obstacle.animations.add('explosion');
	},

	destroyItem: function(bomb, obstacle)
	{
		bomb.kill();
		obstacle.kill();
		var explosion = this.explosions.getFirstExists(false);
		explosion.reset(obstacle.body.x + (obstacle.body.width / 2), obstacle.body.y);
		this.sound.boom.play('', 0, 0.5, false)
		explosion.play('explosion', 30, false, true);
		if ((game.global.score + 1) % 25 == 0)
		{
			game.global.score += (game.global.score / 25);
		}
		else
		{
			game.global.score++;
		}
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