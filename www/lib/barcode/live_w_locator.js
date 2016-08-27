var AppQuagga = function() {
    var resultCollector = Quagga.ResultCollector.create({
        capture: true,
        capacity: 20,
        blacklist: [{code: "2167361334", format: "i2of5"}],
        filter: function(codeResult) {
            // only store results which match this constraint
            // e.g.: codeResult
            return true;
        }
    });

    function init() {
        var self = this;

        Quagga.init(this.state, function(err) {
            if (err) {
                return self.handleError(err);
            }
            Quagga.registerResultCollector(resultCollector);
            App.attachListeners();
            Quagga.start();
        });
    };
    function handleError(err) {
        console.log(err);
    };
    function attachListeners() {
        var self = this;

        $(".controls").on("click", "button.stop", function(e) {
            e.preventDefault();
            Quagga.stop();
            self._printCollectedResults();
        });

        $(".controls .reader-config-group").on("change", "input, select", function(e) {
            e.preventDefault();
            var $target = $(e.target),
                value = $target.attr("type") === "checkbox" ? $target.prop("checked") : $target.val(),
                name = $target.attr("name"),
                state = self._convertNameToState(name);

            console.log("Value of "+ state + " changed to " + value);
            self.setState(state, value);
        });
    };
    function _printCollectedResults() {
        var results = resultCollector.getResults(),
            $ul = $("#result_strip ul.collector");

        results.forEach(function(result) {
            var $li = $('<li><div class="thumbnail"><div class="imgWrApper"><img /></div><div class="caption"><h4 class="code"></h4></div></div></li>');

            $li.find("img").attr("src", result.frame);
            $li.find("h4.code").html(result.codeResult.code + " (" + result.codeResult.format + ")");
            $ul.prepend($li);
        });
    };
    function _accessByPath(obj, path, val) {
        var parts = path.split('.'),
            depth = parts.length,
            setter = (typeof val !== "undefined") ? true : false;

        return parts.reduce(function(o, key, i) {
            if (setter && (i + 1) === depth) {
                o[key] = val;
            }
            return key in o ? o[key] : {};
        }, obj);
    };
    function _convertNameToState(name) {
        return name.replace("_", ".").split("-").reduce(function(result, value) {
            return result + value.charAt(0).toUpperCase() + value.substring(1);
        });
    };
    function detachListeners() {
        $(".controls").off("click", "button.stop");
        $(".controls .reader-config-group").off("change", "input, select");
    };
    function setState(path, value) {
        var self = this;

        if (typeof self._accessByPath(self.inputMApper, path) === "function") {
            value = self._accessByPath(self.inputMApper, path)(value);
        }

        self._accessByPath(self.state, path, value);

        console.log(JSON.stringify(self.state));
        App.detachListeners();
        Quagga.stop();
        App.init();
    };
    inputMApper: {
        inputStream: {
            constraints: function(value){
                var values = value.split('x');
                return {
                    width: parseInt(values[0]),
                    height: parseInt(values[1])
                }
            }
        },
        numOfWorkers: function(value) {
            return parseInt(value);
        },
        decoder: {
            readers: function(value) {
                if (value === 'ean_extended') {
                    return [{
                        format: "ean_reader",
                        config: {
                            supplements: [
                                'ean_5_reader', 'ean_2_reader'
                            ]
                        }
                    }];
                }
                return [{
                    format: value + "_reader",
                    config: {}
                }];
            }
        }
    };
    state: {
        inputStream: {
            type : "LiveStream",
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment"
            }
        },
        locator: {
            patchSize: "medium",
            halfSample: true
        },
        numOfWorkers: 4,
        decoder: {
            readers : [{
                format: "code_128_reader",
                config: {}
            }]
        },
        locate: true
    };
    lastResult : null;

    //App.init();

    Quagga.onProcessed(function(result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
            }
        }
    });

    Quagga.onDetected(function(result) {
        var code = result.codeResult.code;

        if (App.lastResult !== code) {
            App.lastResult = code;
            var $node = null, canvas = Quagga.canvas.dom.image;

            $node = $('<li><div class="thumbnail"><div class="imgWrApper"><img /></div><div class="caption"><h4 class="code"></h4></div></div></li>');
            $node.find("img").attr("src", canvas.toDataURL());
            $node.find("h4.code").html(code);
            $("#result_strip ul.thumbnails").prepend($node);
        }
    });

    return App;
};