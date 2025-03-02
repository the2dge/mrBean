(function($) {
        $(".accordion p").hide(); // Hide all <p> initially
        $(".expanded-box").hide(); // Hide all expanded content initially

        $(".accordion a").click(function(e) {
            e.preventDefault();
            var dropDown = $(this).next("p");

            // Close all other <p> content and remove active class
            $(".accordion p").not(dropDown).slideUp();
            $(".accordion a").not(this).removeClass("active");

            // Close any expanded content when another title is clicked
            $(".expanded-box").slideUp();

            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
            } else {
                $(this).addClass("active");
                dropDown.slideToggle();
            }
        });

        $(".expand-btn").click(function(e) {
            e.stopPropagation(); // Prevent it from triggering the parent accordion toggle
            var expandedBox = $(this).closest("li").find(".expanded-box");

            // Close all other expanded boxes before opening this one
            $(".expanded-box").not(expandedBox).slideUp();

            expandedBox.slideToggle(); // Toggle the expanded box
        });
         $(".video-thumbnail").click(function() {
            var videoUrl = $(this).data("video");
            $("#video-frame").attr("src", videoUrl);
            $(".video-player").slideDown();
        });
    })(jQuery);