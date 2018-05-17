//var ImgWidth = document.getElementById("ul").children[0].children[0].offsetWidth;
//	console.log(ImgWidth)
var box = document.getElementById("all");
		var ul = document.getElementById("ul");
		var ulLis = ul.children;
	//无缝滚动先克隆第一张图片到最后面
	ul.appendChild(ul.children[0].cloneNode(true));
	//创建ol和li小圆点(如果生成小圆点在克隆最后一张图的后面，长度减一，如果在前面就和图片数量一样了，就不用减)
	var ol = document.createElement("ol");
	box.appendChild(ol);
	for(var i=0;i<ulLis.length-1;i++){
		var li = document.createElement("li");
		li.innerHTML = i+1;
		ol.appendChild(li);
	}
	ol.children[0].className = "current";

	//动画部分
	var olLis = ol.children;
	for(var i=0;i<olLis.length;i++){
		olLis[i].index = i;//获得当前li的索引号
		olLis[i].onmouseover = function(){
			for(var j=0;j<olLis.length;j++){
				olLis[j].className = "";
			}
			olLis[this.index].className = "current";
			//this.index*ulLis[0].offsetWidth  是图片的宽度
			animate(ul,-this.index*ulLis[0].offsetWidth);

			square = key = this.index;
		}
	}

	// 匀速动画
	function animate(obj,target){
		clearInterval(obj.timer);
		var speed = obj.offsetLeft < target ? 15 : -15;
		obj.timer = setInterval(function(){
			var result = target - obj.offsetLeft;
			obj.style.left = obj.offsetLeft + speed + "px";
			if(Math.abs(result) <=5){
				clearInterval(obj.timer);
				obj.style.left = target + "px";
			}
			
		},50)
	}

	//4.轮播图定时器
	var timer = null;
	var key = 0;//控制播放张数
	var square = 0;//控制小方块
	timer = setInterval(autoPlay,2000);
	function autoPlay(){
		key++;//先++
		if(key>ulLis.length - 1){
			ul.style.left = 0;
			key = 1;//因为第6张就是第一张，第6张播放，下次播放第2张
		}
		animate(ul,-key*500);

		square++;
		if(square >olLis.length-1){
			square=0;
		}
		for(var i=0;i<olLis.length;i++){
			olLis[i].className = "";
		}
		olLis[square].className = "current";
	}

	box.onmouseover = function(){
		clearInterval(timer);
	}
	box.onmouseout = function(){
		timer = setInterval(autoPlay,2000);
	}