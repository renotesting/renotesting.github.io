
        (function(b,c){var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}})(this);


        // Default carousel
        //var carousel = $('div.carousel-default').floatingCarousel({ autoScroll : true, touchOverflowHidden : false });
        var carouselDefault = new floatingCarousel('#carousel-default');

        // Autoscroll
        var carouselAutoscroll = new floatingCarousel('#carousel-autoscroll', {
                                    autoScroll : true,
                                    autoScrollDirection : 'right',
                                    autoScrollSpeed : 20000,
                                    scrollSpeed : 'fast'
                                });         

        // vertical
        var carouselVertical = new floatingCarousel('#carousel-vertical', {
                                    scrollerAlignment : 'vertical'
                                });

        //responsive
        var opts = {
                autoScroll : true,
                autoScrollSpeed : 20000
            }
        var responsiveCarousel = $('#carousel-responsive').floatingCarousel(opts);
        $(window).resize($.debounce(100, function () {
            responsiveCarousel.update(opts);
        })); 
