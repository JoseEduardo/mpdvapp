var barcode = function() {

 	var UPC_SET = {
        "3211": '0',
        "2221": '1',
        "2122": '2',
        "1411": '3',
        "1132": '4',
        "1231": '5',
        "1114": '6',
        "1312": '7',
        "1213": '8',
        "3112": '9'
    };

	var localMediaStream = null;
	var bars = [];
	var handler = null;

	var dimensions = {
		height: 0,
		width: 0,
		start: 0,
		end: 0
	}

	var elements = {
		video: null,
		canvas: null,
		ctx: null,	
		canvasg: null,
		ctxg: null	
	}


	var config = {
		strokeColor: '#f00',
		start: 0.1,
		end: 0.9,
		threshold: 160,
		quality: 0.45,
		delay: 100,
		video: '',
		canvas: '',
		canvasg: ''
	}

	function init() {

		window.URL = window.URL || window.webkitURL;
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

		elements.video = document.querySelector(config.video);
		elements.canvas = document.querySelector(config.canvas);
		elements.ctx = elements.canvas.getContext('2d');
		elements.canvasg = document.querySelector(config.canvasg);
		elements.ctxg = elements.canvasg.getContext('2d');

		if (navigator.getUserMedia) {
			navigator.getUserMedia({audio: false, video: true}, function(stream) {
				elements.video.src = window.URL.createObjectURL(stream);
			},
			function(stream) {
				console.log('error');
			});
		}

		elements.video.addEventListener('canplay', function(e) {

			dimensions.height = elements.video.videoHeight;
			dimensions.width = elements.video.videoWidth;

			dimensions.start = dimensions.width * config.start;
			dimensions.end = dimensions.width * config.end;

			elements.canvas.width = dimensions.width;
			elements.canvas.height = dimensions.height;
			elements.canvasg.width = dimensions.width;
			elements.canvasg.height = dimensions.height;

			drawGraphics();
			setInterval(function(){snapshot()}, config.delay);

		}, false);
	}

	function snapshot() {
		elements.ctx.drawImage(elements.video, 0, 0, dimensions.width, dimensions.height);
		var imgd = elements.ctx.getImageData(dimensions.start, dimensions.height * 0.5, dimensions.end - dimensions.start, 1);
//		var rgbpixels = imgd.data;
		processImage("barcodecanvasg");		
	}

	function processImage(imgOrId) {
		console.log('processando');
   		var doc = document,
            img = "object" == typeof imgOrId ? imgOrId : doc.getElementById(imgOrId),
            canvas = doc.createElement("canvas"),
            width = img.width,
            height = img.height,
            ctx = canvas.getContext("2d"),
            spoints = [1, 9, 2, 8, 3, 7, 4, 6, 5],
            numLines = spoints.length,
            slineStep = height / (numLines + 1),
            round = Math.round;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0);

        while(numLines--){
            console.log(spoints[numLines]);
            var pxLine = ctx.getImageData(0, slineStep * spoints[numLines], width, 2).data,
                sum = [],
                min = 0,
                max = 0;
            for(var row = 0; row < 2; row++){
                for(var col = 0; col < width; col++){
                    var i = ((row * width) + col) * 4,
                        g = ((pxLine[i] * 3) + (pxLine[i + 1] * 4) + (pxLine[i + 2] * 2)) / 9,
                        s = sum[col];
                    pxLine[i] = pxLine[i + 1] = pxLine[i + 2] = g;
                    sum[col] = g + (undefined == s ? 0 : s);
                }
            }
            for(var i = 0; i < width; i++){
                var s = sum[i] = sum[i] / 2;
                if(s < min){ min = s; }
                if(s > max){ max = s; }
            }
            var pivot = min + ((max - min) / 2),
                bmp = [];
            for(var col = 0; col < width; col++){
                var matches = 0;
                for(var row = 0; row < 2; row++){
                    if(pxLine[((row * width) + col) * 4] > pivot){ matches++; }
                }
                bmp.push(matches > 1);
            }
            var curr = bmp[0],
                count = 1,
                lines = [];
            for(var col = 0; col < width; col++){
                if(bmp[col] == curr){ count++; }
                else{
                    lines.push(count);
                    count = 1;
                    curr = bmp[col];
                }
            }
            var code = '',
                bar = ~~((lines[1] + lines[2] + lines[3]) / 3),
                u = UPC_SET;
            for(var i = 1, l = lines.length; i < l; i++){
                if(code.length < 6){ var group = lines.slice(i * 4, (i * 4) + 4); }
                else{ var group = lines.slice((i * 4 ) + 5, (i * 4) + 9); }
                var digits = [
                    round(group[0] / bar),
                    round(group[1] / bar),
                    round(group[2] / bar),
                    round(group[3] / bar)
                ];
                code += u[digits.join('')] || u[digits.reverse().join('')] || 'X';
                if(12 == code.length){ return code; break; }
            }
            if(-1 == code.indexOf('X')){ return code || false; }
        }
        return false;
	}	

	function setHandler(h) {
		handler = h;
	}

	function drawGraphics() {
		elements.ctxg.strokeStyle = config.strokeColor;
		elements.ctxg.lineWidth = 3;
		elements.ctxg.beginPath();
		elements.ctxg.moveTo(dimensions.start, dimensions.height * 0.5);
		elements.ctxg.lineTo(dimensions.end, dimensions.height * 0.5);
		elements.ctxg.stroke();
	}

	return {
		init: init,
		setHandler: setHandler,
		config: config
	};

	// debugging utilities

	function drawBars(binary) {
		for (var i = 0, ii = binary.length; i < ii; i++) {
			if (binary[i] == 1) {
				elements.ctxg.strokeStyle = '#fff';
			} else {
				elements.ctxg.strokeStyle = '#000';
			}
			elements.ctxg.lineWidth = 3;
			elements.ctxg.beginPath();
			elements.ctxg.moveTo(start + i, height * 0.5);
			elements.ctxg.lineTo(start + i + 1, height * 0.5);
			elements.ctxg.stroke();
		}
	}

}();
