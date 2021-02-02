$(document).ready(function () {
  $("form").submit(function (e) {
    e.preventDefault();
    // Update
    let accountNewData = $(this).serialize();
    $.ajax(`/user/update`, {
      type: "put",
      cache: false,
      crossDomain: true,
      dataType: "json",
      processData: true,
      data: accountNewData,
    })
      .then((res) => {
        console.log(res);
        if (res.status) {
          $(".message")
            .addClass("alert-success")
            .removeClass("alert-danger alert-warning")
            .html("*Update Account SuccessFully ")
            .slideDown(500, function () {
              $(this).slideUp(2000);
            });
        } else {
          $(".message")
            .addClass("alert-warning")
            .removeClass("alert-danger alert-success")
            .html(`* ${res.message}`)
            .slideDown(500, function () {
              $(this).slideUp(2000);
            });
        }
      })
      .catch((err) => {
        alert("Ops !!,Error Try Again");
      });
    /********************* */
  });
});
