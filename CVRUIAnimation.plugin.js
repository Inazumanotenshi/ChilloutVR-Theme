/**
 * @name CVRUIAnimation
 * @description Give your UI the nice animation that the ChilloutVR UI has (inspired by the snowfall js)
 * @version 0.0.1
 * @author Inazumanotenshi
 * @source 
 */

module.exports = (function(CopleHexagon, hexagon, blur, focus){
  class UIEffect {
    start(){
      BdApi.injectCSS("uieffect", CopleHexagon.css);
      hexagon = new CopleHexagon({autoplay: false});
      if(document.hasFocus()) hexagon.play();
      window.addEventListener("blur", blur =_=> hexagon.stop());
      window.addEventListener("focus", focus =_=> hexagon.play());
    }
    stop(){
      hexagon.stop();
      BdApi.clearCSS("uieffect");
      document.getElementById("hexagonfield").remove();
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
    }
  }

  CopleHexagon = (function(window, document, undefined) {
    "use strict";

    var winWidth = window.innerWidth,
      winHeight = window.innerHeight,
      defaultOptions = {
        minSize: 10,
        maxSize: 30,
        type: "text",
        content: "&#10052",
        fadeOut: true,
        autoplay: true,
        interval: 200
      };

    function cssPrefix(propertyName) {
      var capitalizePropertyName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1),
        tempDiv = document.createElement("div"),
        style = tempDiv.style,
        vendorPrefixes = ["Webkit", "Moz", "ms", "O"];

      if (propertyName in style) return propertyName;

      for (var i = 0, l = vendorPrefixes.length; i < l; i++) {
        var name = vendorPrefixes[i] + capitalizePropertyName;
        if (name in style) return name;
      };

      return null;
    };

    var cssPrefixedNames = {
        "transform": cssPrefix("transform"),
        "transition": cssPrefix("transition")
      },
      transitionendEventName = {
        "WebkitTransition": "webkitTransitionEnd",
        "OTransition": "oTransitionEnd",
        "Moztransition": "transitionend",
        "transition": "transitionend"
      }[cssPrefixedNames.transition];

    function random(min, max, deviation) {
      if (deviation) {
        deviation *= max;
        max = max + deviation;
        min = max - deviation;
      } else {
        min = min || 0;
      };
      return parseInt(Math.random() * (max - min + 1) + min);
    };

    function extend(target, source) {
      for (var prop in source) {
        target[prop] = source[prop];
      };
      return target;
    };

    function setStyle(element, rules) {
      for (var name in rules) {
        element.style[cssPrefixedNames[name] || name] = rules[name];
      };
    };

    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") {
      hidden = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
      hidden = "mozHidden";
      visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    };

    window.addEventListener("resize", function() {
      winHeight = window.innerHeight;
      winWidth = window.innerWidth;
    }, false);

    function UIEffect(newOptions) {

      var _ = this,
        queue = [],
        options = defaultOptions,
        $hexagonfield = document.createElement("div"),
        isImage, cntLength, $hexagonflake, timer;

      _.config = function(newOptions) {
        extend(options, newOptions);

        isImage = options.type == "image";
        cntLength = options.content.length;

        $hexagonflake = isImage ? new Image() : document.createElement("div");
        $hexagonflake.className = "hexagonflake hexagonflake-" + options.type;
        $hexagonflake.dataset.type = options.type;
      };

      _.config(newOptions);

      function hexagonflake() {
        var _$hexagonflake = $hexagonflake.cloneNode();
        if (options.type != "solid") {
          _$hexagonflake[isImage ? "src" : "innerHTML"] = typeof options.content == "string" ? options.content : options.content[cntLength == 0 ? 0 : Math.floor(Math.random() * cntLength)];
        };

        return _$hexagonflake;
      };

      function hexagonAnimate() {
        var size = random(options.minSize, options.maxSize);

        // Start unten
        var startTop = winHeight + size;
        var left = random(0, winWidth - size);
        var opacity = random(7, 10) / 10;

        // Zielposition: 25 % nach oben verschwinden
        var targetY = -(winHeight * 0.25);

        // Dezente, aber sichtbare Rotation
        var rotateAngle = random(90, 360);

        // Dauer der Animation
        var duration = random(1500, 3500);

        // Farben rotieren
        var colors = ["#ff3c00", "#5f5f5f", "#ffffff"];
        var color = colors[Math.floor(Math.random() * colors.length)];

        var _$hexagonflake;

        if (queue.length) {
          _$hexagonflake = queue.shift();
          if (_$hexagonflake.dataset.type != options.type)
            _$hexagonflake = new hexagonflake();
        } else {
          _$hexagonflake = new hexagonflake();
        }

        var styleRules = {
          "top": startTop + "px",
          "left": left + "px",
          "opacity": opacity,
          "background-color": color,
          "transform": "translateY(0px) rotate(0deg)",
          "transition": duration + "ms linear"
        };

        switch (options.type) {
          case "solid":
            styleRules.width = styleRules.height = size + "px";
            break;
          case "text":
            styleRules["font-size"] = size + "px";
            styleRules.color = color;
            break;
          case "image":
            styleRules.width = size + "px";
            break;
        }

        setStyle(_$hexagonflake, styleRules);
        $hexagonfield.appendChild(_$hexagonflake);

        setTimeout(function() {
          setStyle(_$hexagonflake, {
            "transform": "translateY(" + targetY + "px) rotate(" + rotateAngle + "deg)",
            "opacity": 0
          });
        }, 60);
      }

      _.playing = 0;

      _.play = function() {
        if (_.playing) return;
        timer = setInterval(hexagonAnimate, options.interval);
        _.playing = 1;
      };

      _.stop = function() {
        if (!_.playing) return;
        clearInterval(timer);
        timer = null;
        _.playing = 0;
      };

      document.addEventListener(visibilityChange, function() {
        document[hidden] ? _.stop() : _.play();
      }, false);

      $hexagonfield.addEventListener(transitionendEventName, function(e) {
        var hexagonflake = e.target || e.srcElement;
        $hexagonfield.removeChild(hexagonflake);
        queue.push(hexagonflake);
      }, false);

      $hexagonfield.id = "hexagonfield";
      document.body.appendChild($hexagonfield);

      options.autoplay && _.play();

      return _;
    };

    return UIEffect;

  })(window, document);
  CopleHexagon.css = `
  #hexagonfield {
    pointer-events: none;
    user-select: none;
    z-index: 100000;
    position: fixed;
  }
  .hexagonflake {
    position: absolute;
    width: 20px;
    height: 20px;
    background: #ff3c00;
    clip-path: polygon(
      50% 0%,
      93% 25%,
      93% 75%,
      50% 100%,
      7% 75%,
      7% 25%
    );
    will-change: transform, opacity;
  }

  .hexagonflake-solid {
  	border-radius: 50%;
  	background: #fff;
  }`;

  return UIEffect;
})();
