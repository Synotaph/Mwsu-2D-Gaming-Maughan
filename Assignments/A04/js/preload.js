var preload = {
	preload:function(){
		console.log("preload.js");
		game.stage.backgroundColor = BG_COLOR

		var loading_border = this.add.image(game.width/2,game.height/2,'loading_border')
		loading_border.anchor.setTo(.5,.5)
		var loading = this.add.sprite(game.width/2,game.height/2,'loading')
		loading.anchor.setTo(.5,.5)
		this.load.setPreloadSprite(loading)
		
		// game entities/world
		this.load.image('player', 'images/vertibird-2.png')
		this.load.image('obstacle1', 'images/grass-platform.png')
		this.load.image('obstacle2', 'images/floating-platform.png')
		this.load.image('obstacle3', 'images/bronze-platform.png')
		this.load.image('obstacle4', 'images/old-platform.png')
		this.load.image('obstacle5', 'images/platform_thin_x7.png')
		this.load.image('pause', 'images/pause.png')
		this.load.image('bg', 'images/cream.png')
		this.load.image('bomb', 'images/mini-nuke-right.png')
		this.load.spritesheet('explosion', 'images/explosions.png', 128, 125);

		// audio
		this.load.audio('bg_spin', 'sounds/spin_bg_music.mp3')
		this.load.audio('bg_edm', 'sounds/edm_bg_music.mp3')
		this.load.audio('score', 'sounds/score.wav')
		this.load.audio('kill', 'sounds/Wilhelm_Scream.ogg')
		this.load.audio('music', 'sounds/abstractionRapidAcrobatics.wav')
		this.load.audio('boom', 'sounds/boom.mp3')

		// font
		game.load.bitmapFont('fontUsed', 'font/ganonwhite/font.png', 'font/ganonwhite/font.xml');

	},
	
	create:function(){
		
		game.state.start('mainMenu')
	}
}