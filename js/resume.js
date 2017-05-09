$('.one').eq(0).show();
$(".top .T-right ul li").click(function() {
	  dex=$(this).index()
	  $('.one').eq(dex).slideDown().siblings('.one').fadeOut();
});

$('#sidebar>ul>li').click(function(){
	  ind=$(this).index()
	  cfTop=$('.container-fluid').eq(ind).offset().top
	  $('body,html').animate({scrollTop:cfTop+"px"},600)
})

$('#sidebar>ul>li').mouseenter(function(){
	 ind=$(this).index()
	 $(' #sidebar .SD-1').eq(ind).show()
})
$('#sidebar>ul>li').mouseleave(function(){
	 ind=$(this).index()
	 $(' #sidebar .SD-1').eq(ind).hide()
})
$('#sidebar>ul>li').eq(0).addClass('sroll')
$(window).scroll(function(){
	  re=$(window).scrollTop();
	  $('.container-fluid').each(function(){
	  ind=$(this).index()
	  cfTop=$('.container-fluid').eq(ind).offset().top-300
	  if(re>=cfTop){
	  $('#sidebar>ul>li').each(function(){
	  	  $('#sidebar>ul>li').eq(ind).addClass('sroll')
	  	  $('#sidebar>ul>li').not($('#sidebar>ul>li').eq(ind)).removeClass('sroll')
	  	})}
	  if(re>=1400&&re<=2300){
	  	  music[0].play();
	  }else{
	  	  music[0].pause()
	  }
	  })  
})
  music=$('#musics')
$('#sidebar>ul>li').eq(2).click(function(){
	    music[0].play();
	    $(this).siblings('#sidebar>ul>li').click(function(){
	    music[0].pause();})
})


//俄罗斯方块
var Tetris = function(options) {
		this.e_playArea = $("#play_area");
		this.e_startBtn = $("#play_btn_start");
		this.e_playScore = $("#play_score");
		this.e_playDirection = $("#play_direction");
		this.e_levelBtn = $("#play_btn_level");
		this.e_levelMenu = $("#play_menu_level");
		this.e_nextType = $("#play_nextType");
   
		this.cellCol = 15;
		this.cellRow = 24;
		this.cellArr = [];
		this.miniCellArr = [];
		this.score = 0;
		this.direction = "bottom";
		this.timer = null;
		this.interval = [ 600, 300, 100 ];
		this.levelScore = [ 10, 20, 40 ];
		this.doubleScore = [ 1, 4, 10, 20 ];
		this.level = 1;

		this.playing = false;
		this.turning = false;
		this.death = false;

		this.offsetCol = Math.floor(this.cellCol / 2);
		this.offsetRow = -3;
		this.offsetFix = 0;
		this.tetrisArr = [];
		this.tetrisArr[0] = [ [ 0, 1, this.cellCol, this.cellCol + 1 ],
				[ 0, 1, this.cellCol, this.cellCol + 1 ] ];
		this.tetrisArr[1] = [
				[ 1, this.cellCol - 1, this.cellCol, this.cellCol + 1 ],
				[ 0, this.cellCol, this.cellCol * 2, this.cellCol * 2 + 1 ],
				[ this.cellCol - 1, this.cellCol, this.cellCol + 1,
						this.cellCol * 2 - 1 ],
				[ -1, 0, this.cellCol, this.cellCol * 2 ] ];
		this.tetrisArr[2] = [
				[ -1, this.cellCol - 1, this.cellCol, this.cellCol + 1 ],
				[ 0, 1, this.cellCol, this.cellCol * 2 ],
				[ this.cellCol - 1, this.cellCol, this.cellCol + 1,
						this.cellCol * 2 + 1 ],
				[ 0, this.cellCol, this.cellCol * 2 - 1, this.cellCol * 2 ] ];
		this.tetrisArr[3] = [
				[ 0, this.cellCol, this.cellCol + 1, this.cellCol * 2 + 1 ],
				[ this.cellCol, this.cellCol + 1, this.cellCol * 2 - 1,
						this.cellCol * 2 ] ];
		this.tetrisArr[4] = [
				[ 0, this.cellCol - 1, this.cellCol, this.cellCol * 2 - 1 ],
				[ this.cellCol - 1, this.cellCol, this.cellCol * 2,
						this.cellCol * 2 + 1 ] ];
		this.tetrisArr[5] = [
				[ 0, this.cellCol - 1, this.cellCol, this.cellCol + 1 ],
				[ 0, this.cellCol, this.cellCol + 1, this.cellCol * 2 ],
				[ this.cellCol - 1, this.cellCol, this.cellCol + 1,
						this.cellCol * 2 ],
				[ 0, this.cellCol - 1, this.cellCol, this.cellCol * 2 ] ];
		this.tetrisArr[6] = [
				[ 0, this.cellCol, this.cellCol * 2, this.cellCol * 3 ],
				[ this.cellCol - 1, this.cellCol, this.cellCol + 1,
						this.cellCol + 2 ] ];
		this.tetrisType = [ 1, 1 ];
		this.tetrisType = [ 1, 0 ];
		this.tetrisTypeArr = [];

		this.preTetris = [];
		this.thisTetris = [];
		this.fullArr = [];

		this.start();
	};
	Tetris.prototype = {
		start : function() {
			this.init();
			this.menu();
			this.control();
		},
		setOptions : function(options) {
			this.score = options.score === 0 ? options.score
					: (options.score || this.score);
			this.level = options.level === 0 ? options.level
					: (options.level || this.level);
		},
		resetArea : function() {
			$(".play_cell.active").removeClass("active");
			this.setOptions({
				"score" : 0
			});
			this.e_playScore.html(this.score);
		},
		menu : function() {
			var self = this;

			this.e_startBtn.click(function() {
				self.e_levelMenu.hide();
				if (self.playing) {
					self.pause();
				} else if (self.death) {
					self.resetArea();
					self.play();
				} else {
					self.play();
				}
			});
			this.e_levelBtn.click(function() {
				if (self.playing)
					return;
				self.e_levelMenu.toggle();
			});
			this.e_levelMenu.find("a").click(function() {
				self.e_levelMenu.hide();
				self.e_levelBtn.find(".level_text").html($(this).html());
				self.setOptions({
					"level" : $(this).attr("level")
				});
				//alert(self.interval[self.level])
			});
		},
		play : function() {
			var self = this;
			this.e_startBtn.html("暂停");
			this.playing = true;
			this.death = false;
			if (this.turning) {
				this.timer = setInterval(function() {
					self.offsetRow++;
					self.showTetris();
				}, this.interval[this.level]);
			} else {
				this.nextTetris();
			}

		},
		pause : function() {
			this.e_startBtn.html("开始");
			this.playing = false;
			clearTimeout(this.timer);
		},
		init : function() {
			var self = this, _ele, _miniEle, _arr = [];
			for ( var i = 0; i < this.cellRow; i++) {
				for ( var j = 0; j < this.cellCol; j++) {
					_ele = document.createElement("div");
					_ele.className = "play_cell";
					_ele.id = "play_cell_" + i + "_" + j;
					this.cellArr.push($(_ele));
					this.e_playArea.append(_ele);
				}
			}

			for ( var m = 0; m < 16; m++) {
				_miniEle = document.createElement("div");
				_miniEle.className = "play_mini_cell";
				this.miniCellArr.push($(_miniEle));
				this.e_nextType.append(_miniEle);
			}

			for ( var k = 0, klen = this.tetrisArr.length; k < klen; k++) {
				for ( var j = 0, jlen = this.tetrisArr[k].length; j < jlen; j++) {
					this.tetrisTypeArr.push([ k, j ]);
				}
			}
			;

			this.nextType = this.tetrisTypeArr[Math
					.floor(this.tetrisTypeArr.length * Math.random())];
			this.showNextType();

		},
		control : function() {
			var self = this;
			$("html").keydown(function(e) {
				if (!self.playing)
					return !self.playing;
				switch (e.keyCode) {
				case 37:
					self.direction = "left";
					break;
				case 38:
					self.direction = "top";
					break;
				case 39:
					self.direction = "right";
					break;
				case 40:
					self.direction = "bottom";
					break;
				default:
					return;
					break;
				}
				self.e_playDirection.html(self.direction);
				self.drive();
				return false;
			});
		},
		changTetris : function() {
			var _len = this.tetrisArr[this.tetrisType[0]].length;
			if (this.tetrisType[1] < _len - 1) {
				this.tetrisType[1]++;
			} else {
				this.tetrisType[1] = 0;
			}
		},
		drive : function() {
			switch (this.direction) {
			case "left":
				if (this.offsetCol > 0)
					this.offsetCol--;
				break;
			case "top":
				this.changTetris();
				break;
			case "right":
				this.offsetCol++;
				break;
			case "bottom":
				if (this.offsetRow < this.cellRow - 2)
					this.offsetRow++;
				break;
			default:
				break;
			}
			this.showTetris(this.direction);
		},
		showTetris : function(dir) {
			var _tt = this.tetrisArr[this.tetrisType[0]][this.tetrisType[1]], _ele, self = this;
			this.turning = true;
			this.thisTetris = [];
			for ( var i = _tt.length - 1; i >= 0; i--) {
				_ele = this.cellArr[_tt[i] + this.offsetCol + this.offsetRow
						* this.cellCol];
				if (this.offsetCol < 7
						&& (_tt[i] + this.offsetCol + 1) % this.cellCol == 0) {
					this.offsetCol++;
					return;
				} else if (this.offsetCol > 7
						&& (_tt[i] + this.offsetCol) % this.cellCol == 0) {
					this.offsetCol--;
					return;
				}
				if (_ele && _ele.hasClass("active") && dir == "left"
						&& ($.inArray(_ele, this.preTetris) < 0)) {
					if (($.inArray(_ele, this.cellArr) - $.inArray(
							this.preTetris[i], this.cellArr))
							% this.cellCol != 0) {
						this.offsetCol++;
						return;
					}
				}
				if (_ele && _ele.hasClass("active") && dir == "right"
						&& ($.inArray(_ele, this.preTetris) < 0)) {
					if (($.inArray(_ele, this.cellArr) - $.inArray(
							this.preTetris[i], this.cellArr))
							% this.cellCol != 0) {
						this.offsetCol--;
						return;
					}
				}
				if (_ele) {
					if (_ele.hasClass("active")
							&& ($.inArray(_ele, this.preTetris) < 0)) {
						this.tetrisDown();
						return;
					} else {
						this.thisTetris.push(_ele);
					}
				} else if (this.offsetRow > 0) {
					this.tetrisDown();
					return;
				}
			}
			;
			for ( var j = 0, jlen = this.preTetris.length; j < jlen; j++) {
				this.preTetris[j].removeClass("active");
			}
			for ( var k = 0, klen = this.thisTetris.length; k < klen; k++) {
				this.thisTetris[k].addClass("active");
			}
			this.preTetris = this.thisTetris.slice(0);
		},
		tetrisDown : function() {
			clearInterval(this.timer);
			var _index;
			this.turning = false;
			forOuter: for ( var j = 0, jlen = this.preTetris.length; j < jlen; j++) {
				_index = $.inArray(this.preTetris[j], this.cellArr);
				for ( var k = _index - _index % this.cellCol, klen = _index
						- _index % this.cellCol + this.cellCol; k < klen; k++) {
					if (!this.cellArr[k].hasClass("active")) {
						continue forOuter;
					}
				}
				if ($.inArray(_index - _index % this.cellCol, this.fullArr) < 0)
					this.fullArr.push(_index - _index % this.cellCol);
			}
			if (this.fullArr.length) {
				this.getScore();
				return;
			}
			for ( var i = 6; i < 9; i++) {
				if (this.cellArr[i].hasClass("active")) {
					this.gameOver();
					return;
				}
			}
			this.nextTetris();
		},
		nextTetris : function() {
			var self = this;
			clearInterval(this.timer);
			this.preTetris = [];
			this.offsetRow = -2;
			this.offsetCol = 7;
			this.tetrisType = this.nextType;
			this.nextType = this.tetrisTypeArr[Math
					.floor(this.tetrisTypeArr.length * Math.random())];
			this.showNextType();
			this.timer = setInterval(function() {
				self.offsetRow++;
				self.showTetris();
			}, this.interval[this.level]);
		},
		showNextType : function() {
			var _nt = this.tetrisArr[this.nextType[0]][this.nextType[1]], _ele, _index;
			this.e_nextType.find(".active").removeClass("active");
			for ( var i = 0, ilen = _nt.length; i < ilen; i++) {
				if (_nt[i] > this.cellCol - 2) {
					_index = (_nt[i] + 2) % this.cellCol - 2 + 1 + 4
							* parseInt((_nt[i] + 2) / this.cellCol);
				} else {
					_index = _nt[i] + 1;
				}
				_ele = this.miniCellArr[_index];
				_ele.addClass("active");
			}
		},
		getScore : function() {
			var self = this;
			for ( var i = this.fullArr.length - 1; i >= 0; i--) {
				for ( var j = 0; j < this.cellCol; j++) {
					this.cellArr[j + this.fullArr[i]].removeClass("active");
					if (j == this.cellCol - 1) {
						for ( var k = this.fullArr[i]; k >= 0; k--) {
							if (this.cellArr[k].hasClass("active")) {
								this.cellArr[k].removeClass("active");
								this.cellArr[k + this.cellCol]
										.addClass("active");
							}
						}
					}
				}

			}
			this.score += this.levelScore[this.level]
					* this.doubleScore[this.fullArr.length - 1];
			this.e_playScore.html(this.score);
			this.fullArr = [];
			this.nextTetris();
		},
		gameOver : function() {
			this.death = true;
			this.pause();
			return;
		}
	};
	$(document).ready(function(e) {
		var t = new Tetris();
	});

     
  	
