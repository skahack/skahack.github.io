var $ = require('jquery');
var _ = require('underscore');

function Scroll(selector, offsetTop) {
  var offsets = [];
  var scrollWidth = document.documentElement.scrollWidth;
  var fixedPosition = scrollWidth - $('.section').first().offset().left + 30;
  this.els = $(selector);
  this.$window = $(window);

  this.els
    .map(function(){
      var parentEl = $(this).closest('.section');

      return [{
        el: this,
        offset: this.offsetTop - offsetTop,
        parentOffset: parentEl[0].offsetTop + parentEl[0].offsetHeight - offsetTop,
        offsetTop: offsetTop,
        fixedPosition: fixedPosition,
        status: 'deactive',
        clone: null,
        isDeactive: function(){
          return this.status === 'deactive';
        },
        isActive: function(){
          return this.status === 'active';
        },
        isEnd: function(){
          return this.status === 'end';
        }
      }];
    })
    .sort(function(a, b){
      return a.offset - b.offset;
    })
    .each(function(){
      offsets.push(this);
    });

  this.offsets = offsets;
  this.process();
}

Scroll.prototype.process = function(){
  var scrollTop = this.$window.scrollTop();

  _.each(this.offsets, function(v, index, l){
    var $el = $(v.el);

    if (v.isDeactive() && v.offset - 25 <= scrollTop) {
      var clone = $el.clone();

      clone.css({
        position: 'fixed',
        right: v.fixedPosition,
        top: v.offsetTop,
        'transition-property': 'color',
        'transition-duration': '2s',
        color: 'rgba(0,0,0,0)'
      });
      $el.after(clone);
      window.setTimeout(function(){
        clone.css({ color: 'rgba(0,0,0,0.1)' });
      }, 0);

      l[index].status = 'active';
      l[index].clone = clone;
    }
    else if (v.isEnd() && v.parentOffset - 50 >= scrollTop) {
      v.clone.css({
        position: 'fixed',
        top: v.offsetTop
      });

      l[index].status = 'active';
    }
    else if (v.isActive() && v.parentOffset - 50 <= scrollTop) {
      v.clone.css({
        position: 'absolute',
        top: v.parentOffset - 50
      });

      l[index].status = 'end';
    }
    else if (v.isActive() && v.offset - 25 >= scrollTop) {
      v.clone.remove();

      l[index].status = 'deactive';
      l[index].clone = null;
    }
  });
};

$(function(){
  var h1 = new Scroll('.m-book h1', 0);
  var h2 = new Scroll('.m-book h2', 40);
  $(window).on('scroll', _.throttle(function(){
    h1.process();
    h2.process();
  }, 100));
});
