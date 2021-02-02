(function ($) {
  "use strict";

  /*==================================================================
    [ Focus input ]*/
  $(".input100").each(function () {
    $(this).on("blur", function () {
      if ($(this).val().trim() != "") {
        $(this).addClass("has-val");
      } else {
        $(this).removeClass("has-val");
      }
    });
  });

  /*=================[ Validate ]===================*/
  var input = $(".form-control");

  $(".validate-form").on("submit", function (e) {
    var check = true;
    e.preventDefault();

    $(".errors").children().remove();
    $(".btn-lg").attr('disabled', true);
    $(".btn-lg").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="margin-bottom: 5px;"></span> Loading...</button>')

    for (var i = 0; i < input.length; i++) {
      if (validate(input[i]) == false) {
        showValidate(input[i]);
        check = false;
      }else{
        hideValidate(input[i]);
      }
    }

    if(!check) {
      $(".errors").append(`<span>Merci de vérifier que tous les champs sont bien renseignés !</span>`)
      $(".btn-lg").attr('disabled', false);
      $(".btn-lg").html('SE CONNECTER')
    }
    else if (check) {
      var userEmail = $(input[0]).val().trim();
      var userPassword = $(input[1]).val().trim();
      fetch("user/login", {
        method: "POST",
        cache: "no-cache",
        mode: "cors",
        headers: new Headers({
          "Content-Type": "application/json;charset=utf-8",
        }),
        body: JSON.stringify({
          email: userEmail,
          password: userPassword,
        }),
      })
        .then((result) => result.json())
        .then((res) => {
          if (res.status == 2) {
            var errors = "";
            res.message.forEach((error) => {
              errors += `<span>* ${error.msg}</span></br>`;
            });
            
            $(".errors").html(errors)

          } else if (res.status == 0) {
            $(".errors")
              .append(`<span>${res.message}</span>`)
            $(".btn-lg").attr('disabled', false);
            $(".btn-lg").html('SE CONNECTER')

          } else {
            window.location.href = res.message;
          }
        })
        .catch((err) => {
          alert("Ops !! Error Try Again");
          console.log(err);
        });
    }
  });

  $(".validate-form .input100").each(function () {
    $(this).focus(function () {
      hideValidate(this);
    });
  });

  function validate(input) {
    if ($(input).attr("type") == "email" || $(input).attr("name") == "email") {
      if (
        $(input)
          .val()
          .trim()
          .match(
            /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/
          ) == null
      ) {
        return false;
      }
    } else {
      if ($(input).val().trim() == "" || $(input).val().trim().length < 8) {
        return false;
      }
    }
  }

  function showValidate(input) {
    $(input).addClass("error-validate");
  }

  function hideValidate(input) {
    $(input).removeClass("error-validate");
  }

  /*==================================================================
    [ Show pass ]*/
  var showPass = 0;
  $(".btn-show-pass").on("click", function () {
    if (showPass == 0) {
      $(this).parent().children().first().attr("type", "text");
      $(this).removeClass("fa-eye-slash").addClass("fa-eye");
      showPass = 1;
    } else {
      $(this).parent().children().first().attr("type", "password");
      $(this).removeClass("fa-eye").addClass("fa-eye-slash");
      showPass = 0;
    }
  });
})(jQuery);
