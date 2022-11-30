/*
* Show trending courses on and related courses
*/
const showTrendingOrFeaturedCourses = () => {
  let $grids = $('.details-grid, .trending-grid');
  let courses = localStorage.courses ? JSON.parse(localStorage.courses) : [];
  if($grids.length > 0 && courses.records.length) {
    $.each($grids, (index, $grid) => {
      courses.records.forEach((course, index) => {
        if(course.fields && course.fields.Featured) {
          let $courseItem = $(`<a href="/course/details" class="course-block w-inline-block">
            <div class="course-header" style="background-image:url(${course.fields.Image[0].url});"></div>
            <div class="course-info-wrapper">
              <div class="div-block-5">
                <div class="course-title">${course.fields.Title} <br></div>
                <div class="course-blurb">${course.fields.Details}</div>
              </div>
              <div class="course-price-block w-clearfix"></div>
            </div>
          </a>`);
          $($grid).append($courseItem);
          $courseItem.click((e) => {
            localStorage.setItem('selectedCourse', JSON.stringify(course));
          });
        }
      });
    });
  }
};

/*
* Show course details
*/
const showCourseDetails = () => {
  let $detailsPage = $('.course-details');
  let selectedCourse = localStorage.selectedCourse ? JSON.parse(localStorage.selectedCourse) : false;
  if($detailsPage.length > 0 && selectedCourse) {
    $('.course-section').css({'backgroundImage': `url(${selectedCourse.fields.Image[0].url})`});
    $('.course-header-h1, .dashboard-course-title').text(selectedCourse.fields.Title);
    $('.course-description').text(selectedCourse.fields.Details);
    $('.course-wrapper .course-header').css({'backgroundImage': `url(${selectedCourse.fields.Image[0].url})`});
    $('.pricing-description').html(selectedCourse.fields.Description.trim().replace(/\n/gi, '<br>'));
    $('#duration').text(moment.duration(selectedCourse.fields.Duration, 'seconds').asHours() + ' hour(s)');
    $('#type').text(selectedCourse.fields.Type);
    $('#category').text(selectedCourse.fields.Category);
    $('.tutor-profile').css({'backgroundImage': `url(${selectedCourse.fields["Tutor Image"][0].url})`});
    $('.tutor-name').text(selectedCourse.fields.Tutor);
    $('.tutor-description').text(selectedCourse.fields['Tutor Description']);
    if (selectedCourse.fields["What You Will Learn"] && selectedCourse.fields["What You Will Learn"].length) {
      selectedCourse.fields["What You Will Learn"].forEach((item, index) => {
        $('.course-list').append($(`<li class="course-list-item"><div class="list-label">${item}</div></li>`));
      });
    }
  }
};

/*
* Show all courses 
*/
const showAllCourses = () => {
  let $grids = $('.grid'), $aCourses = $('.admin-courses');
  let courses = localStorage.courses ? JSON.parse(localStorage.courses) : [];
  if($grids.length > 0 && courses.records.length) {
    $.each($grids, (index, $grid) => {
      courses.records.forEach((course, index) => {
        if(course.fields) {
          let $courseItem = $(`<a href="/course/details" class="course-block w-inline-block">
            <div class="course-header" style="background-image:url(${course.fields.Image[0].url});"></div>
            <div class="course-info-wrapper">
              <div class="div-block-5">
                <div class="course-title">${course.fields.Title} <br></div>
                <div class="course-blurb">${course.fields.Details}</div>
              </div>
              <div class="course-price-block w-clearfix"></div>
            </div>
          </a>`);
          $($grid).append($courseItem);
          $courseItem.click((e) => {
            localStorage.setItem('selectedCourse', JSON.stringify(course));
          });
        }
      });
    });
  }
  if($aCourses.length && courses.records.length) {
    $aCourses.empty();
    courses.records.forEach((course, index) => {
      if(course.fields) {
        let $courseItem = $(`<a href="#" class="course-block w-inline-block">
          <div class="course-header" style="background-image:url(${course.fields.Image[0].url});"></div>
          <div class="course-info-wrapper">
            <div class="div-block-5">
            <div class="course-title">${course.fields.Title} <br></div>
            <div class="course-blurb">${course.fields.Details}</div>
            </div>
            <div class="course-price-block w-clearfix"></div>
          </div>
        </a>`);
        $($aCourses).append($courseItem);
        $courseItem.click((e) => {
          localStorage.setItem('selectedCourse', JSON.stringify(course));
          let $detailsContainer = $('.course-detail-wrapper');

          let $detailsEl = $(`<div class="class-image w-clearfix" style="background-image:url(${course.fields.Image[0].url});">
              <a href="/administrator/new/course/1" class="button edit w-button">Edit</a>
            </div>
            <div class="class-block w-clearfix">
              <div class="class-info-block">
                <h3 class="interested-heading-h1">${course.fields.Title}</h3>
                <div class="course-blurb">${course.fields.Details}</div>
              </div>
              <div class="class-details w-clearfix">
                <div class="course-details w-clearfix">
                  <div class="pill-label">Duration</div>
                  <div class="pill-description">1hr : 30min</div>
                </div>
                <div class="course-details w-clearfix">
                  <div class="pill-label">Type</div>
                  <div class="pill-description">Online, Group</div>
                </div>
                <div class="course-details w-clearfix">
                  <div class="pill-label">Catogory</div>
                  <div class="pill-description">English</div>
                </div>
              </div>
            </div>`);

            $detailsContainer.empty();
            $detailsContainer.append($detailsEl);
        });
      }
    });
  }
};

const showAllTutors = async () => {
  let $tutorGrid = $('.all-tutors');

  if($tutorGrid.length) {
    // const token = await auth0.getTokenSilently();
    const fetchTutors = await fetch("/api/get/tutors");
    const tutors = await fetchTutors.json();
    $tutorGrid.empty();
    $('.tutor-count').text(tutors.filter((t, i) => { return !t.fields["Is Verified"]; }).length);
    $('.tutor-badge .avatars').empty();
    tutors.filter((t, i) => { return !t.fields["Is Verified"]; }).forEach(() => {
      $('.tutor-badge .avatars').append($('<div class="participants-avatar"></div>'));
      $('.tutor-badge .notification').removeClass("hidden");
    });
    $('.tutor-badge').removeClass("hidden");
    tutors.forEach((tutor, index) => {
      $tutorGrid.append($(`<div class="w-layout-grid student-grid">
      <div class="admin-grid-block">
        <div class="admin-student-avatar"></div>
      </div>
      <div class="admin-grid-block">
        <div>${tutor.fields.Name}</div>
      </div>
      <div class="admin-grid-block">
        <div>${tutor.fields.Email}</div>
      </div>
      <div class="admin-grid-block">
        <div>${tutor.fields.Phone}</div>
      </div>
      <a id="w-node-f1e4d5424c09-801ae083" href="#" class="admin-grid-block guardian w-inline-block">
        <div>${tutor.fields["Classes Assigned"] ? tutor.fields["Classes Assigned"].length : 0} Assigned</div>
      </a>
    </div>`));
    });

  }
}; 

const showAllStudents = async () => {
  let $studentGrid = $('.all-students');

  if($studentGrid.length) {
    // const token = await auth0.getTokenSilently();
    const fetchStudents = await fetch("/api/get/students", {
      // headers: {
      //   Authorization: `Bearer ${token}`
      // }
    });
    const students = await fetchStudents.json();
    $studentGrid.empty();
    $('.student-count').text(students.filter((t, i) => { return !t.fields["Is Verified"]; }).length);
    $('.student-badge .avatars').empty();
    students.filter((t, i) => { return !t.fields["Is Verified"]; }).forEach(() => {
      $('.student-badge .avatars').append($('<div class="participants-avatar"></div>'));
      $('.student-badge .notification').removeClass("hidden");
    });
    $('.student-badge').removeClass("hidden");
    students.forEach((student, index) => {
     $studentGrid.append($(`<div class="w-layout-grid student-grid">
      <div class="admin-grid-block">
        <div class="admin-student-avatar"></div>
      </div>
      <div class="admin-grid-block">
        <div>${student.fields["First Name"]} ${student.fields["Surname"]}</div>
      </div>
      <div class="admin-grid-block">
        <div>${student.fields["Guardian Email"]}</div>
      </div>
      <div class="admin-grid-block">
        <div>${student.fields["Current School"]}</div>
      </div>
      <a id="w-node-f1e4d5424c09-eff1f3b6" href="#" class="admin-grid-block guardian w-inline-block">
        <div>${student.fields["Guardian Name"]}</div>
      </a>
    </div>`));
    });
  }
};

const showAllGuardians = async () => {
  let $guardianGrid = $('.guardian-list');
  if($guardianGrid.length) {
    // const token = await auth0.getTokenSilently();
    const fetchStudents = await fetch("/api/get/students", {
      // headers: {
      //   Authorization: `Bearer ${token}`
      // }
    });
    const students = await fetchStudents.json();
    let guardians = [];
    $('.student-count').text(students.filter((t, i) => { return !t.fields["Is Verified"]; }).length);
    $('.student-badge .avatars').empty();
    students.filter((t, i) => { return !t.fields["Is Verified"]; }).forEach(() => {
      $('.student-badge .avatars').append($('<div class="participants-avatar"></div>'));
      $('.student-badge .notification').removeClass("hidden");
    });
    $('.student-badge').removeClass("hidden");
    students.forEach((student, index) => {
      let guardian = {};
      if( !guardians.filter((g,i) => { return g.Email === student.fields["Guardian Email"]; }).length ) {
        guardian.Name = student.fields["Guardian Name"];
        guardian.Email = student.fields["Guardian Email"];
        guardian.Phone =  student.fields["Guardian Phone"];
        guardian.Postal = student.fields["Guardian Postal Address"];
        guardian.Address = student.fields["Guardian House Address"];
        guardian.Relationship = student.fields["Relationship to Guardian"];
        guardian.Ward = student.fields["First Name"] + " " + student.fields["Surname"];
        guardians.push(guardian);
      }
    });
    $guardianGrid.empty();
    guardians.forEach((guardian, index) => {
      $guardianGrid.append($(`<div class="w-layout-grid student-grid">
      <div class="admin-grid-block">
        <div class="admin-student-avatar"></div>
      </div>
      <div class="admin-grid-block">
        <div>${guardian.Name}</div>
      </div>
      <div class="admin-grid-block">
        <div>${guardian.Email}</div>
      </div>
      <div class="admin-grid-block">
        <div>${guardian.Ward}</div>
      </div>
      <a id="w-node-f1e4d5424c09-eff1f3b6" href="#" class="admin-grid-block guardian w-inline-block">
        <div>${guardian.Relationship}</div>
      </a>
    </div>`));
    });
  }
};

const showAllTutorClasses = async () => {
  let $tutorClassesGrid = $('.upcoming-class > #assigned');
  if($tutorClassesGrid.length) {
    // const token = await auth0.getTokenSilently();
    const fetchTutorClasses = await fetch("/api/get/tutor/classes", {
      // headers: {
      //   Authorization: `Bearer ${token}`
      // }
    });
    const classes = await fetchTutorClasses.json();
    $tutorClassesGrid.empty();
    classes.records.forEach((class_, index) => {
      $tutorClassesGrid.append($(`<div class="course-block tutors">
      <div class="course-header w-clearfix">
        <div class="course-badge">New</div>
      </div>
      <div class="course-info-wrapper tutors">
        <div class="div-block-5">
          <h3 class="interested-heading-h1">${class_.fields["Class Title"]}</h3>
          <div class="course-blurb">${class_.fields["Description"]}</div>
        </div>
        <div class="tutor-class-block">
          <div class="upcoming-time-block w-clearfix">
            <div class="time">Date</div>
            <div class="upcoming-date">${moment(class_.fields["Start Date"]).format("MMM DD ddd yy")}s</div>
          </div>
          <div class="upcoming-time-block w-clearfix">
            <div class="time">Time</div>
            <div class="upcoming-date">${class_.fields["Start Time"]}</div>
          </div>
          <div class="upcoming-time-block w-clearfix">
            <div class="time">Duration</div>
            <div class="upcoming-date">1h 30min</div>
          </div>
          <div class="upcoming-time-block w-clearfix">
            <div class="time">Type</div>
            <div class="upcoming-date">${class_.fields["Type"]}</div>
          </div>
        </div>
        <a href="/student/classroom" data-class-info='${JSON.stringify(class_)}' class="button enter-class w-button">Enter Class Room</a>
      </div>
      <div class="time-stamp-badge">
        <div>Created ${moment(class_.fields["Created"]).from(moment())}</div>
      </div>
    </div>`));
    });
    $('a.enter-class').on("click", function(e) {
      var classInfo = JSON.parse($(e.target).attr('data-class-info'));
      var courses = localStorage.courses ? JSON.parse(localStorage.courses) : [];
      var selectedCourse = courses.filter((c, i) => { return c.id === classInfo.fields.Course[0];})
      localStorage.setItem("selectedClass", JSON.stringify(classInfo));
      localStorage.setItem("selectedCourse", JSON.stringify(selectedCourse[0]));
    });
  }
};

const showAllClasses = async () => {
  let $classesGrid = $('.all-classes');
  let $upcomingClass = $('.upcoming-class');

  if($classesGrid.length) {
    // const token = await auth0.getTokenSilently();
    // const user = await auth0.getUser();
    const fetchClasses = await fetch("/api/get/classes", {
      method : "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        // Authorization: `Bearer ${token}`
      }
      // body : JSON.stringify(user)
    });
    const classes = await fetchClasses.json();
    localStorage.setItem("classes", JSON.stringify(classes));
    
    if($upcomingClass.length) {
      classes.forEach((cls, index) => {
        $upcomingClass.append($(`<a href="/student/classroom" data-class-info='${JSON.stringify(cls)}' class="upcoming-block w-inline-block">
        <div class="indicator"></div>
        <div class="div-block-6">
          <div class="upcoming-date">${moment(cls.fields["Start Date"]).format("MMM DD ddd yy")}</div>
          <div class="text-block-7">At ${cls.fields["Start Time"]}</div>
          <div>${cls.fields["Class Title"]}</div>
        </div>
      </a>`));
      })
      $('a.upcoming-block').on("click", function(e) {
        var classInfo = JSON.parse($(e.target).attr('data-class-info'));
        var courses = localStorage.courses ? JSON.parse(localStorage.courses) : [];
        var selectedCourse = courses.records.filter((c, i) => { return c.id === classInfo.fields.Course[0];})
        localStorage.setItem("selectedClass", JSON.stringify(classInfo));
        localStorage.setItem("selectedCourse", JSON.stringify(selectedCourse[0]));
      });
    }
  }
};

const renderEmailPages = () => {
  var $email = $('#email-form');
      const urlParams = new URLSearchParams(window.location.search);
      if ($email.length) {
          if (urlParams.get('state')) {
              if (urlParams.get('state') === "success") {
                  $('.w-form-done').show();
                  $('.w-form-fail').hide();
              }
              if (urlParams.get('state') === "error") {
                  $('.w-form-done').hide();
                  $('.w-form-fail').show();
              }
          }
      }
};

/**
 * Updates the user interface
 */
const updateUI = async () => {
  
    showTrendingOrFeaturedCourses();
    showCourseDetails();
    showAllCourses();
    renderEmailPages();
    
    showAllTutors();
    showAllGuardians();
    showAllClasses();
    showAllStudents();
    showAllTutorClasses();

    let selectedClass = localStorage.selectedClass ? JSON.parse(localStorage.selectedClass) : false;
    if (selectedClass && $('.tutor-name').length) {
      $('.tutor-name').text(selectedClass.fields["Name (from Tutors)"][0]);
      $('.student-count').text(selectedClass.fields["Students"].length);
      $('.participants').empty();
      selectedClass.fields["Students"].forEach(element => {
        $('.participants').append($(`<div class="participants-avatar"></div>`))
      });
    }

    console.log("UI updated");
};

