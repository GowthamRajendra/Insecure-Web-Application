# Major Group Project 2

For this project, you are permitted to work in a group of 3-5 students.  Please enter this information, below, and enter the same information into this [Google Sheet](https://docs.google.com/spreadsheets/d/1_ouEIs0xGsnJacby89R9Acjy80zxef26E4L2iUgYGhM/edit?usp=sharing) (along with your topic).

| Group Member Name    | GitHub Username     |
| -------------------- | ------------------- |
| <member full name 1> | <member username 1> |
| <member full name 2> | <member username 2> |
| <member full name 3> | <member username 3> |
| <member full name 4> | <member username 4> |
| <member full name 5> | <member username 5> |

*Note:  It is not possible to earn full marks if you are not part of a group (accessibility exceptions excluded, of course).*

## Overview

This course has two likely categories of student.

1. A student who wants to be a software developer, and intends to learn more about vulnerabilities to watch out for, as well as how to protect against attacks.
2. A student who wants to be a cybersecurity professional, and wants to learn more about attack types and bypassing protections.

As a result, this major group project will give you two options; one option for each of these types of student.

Regardless which option you choose, both project types will require a presentation.

## Requirements

### Presentation

Each group will choose one (unique) vulnerability that has not been covered during the lectures.  A presentation will be created which describes the vulnerability, describes how to perform an attack, and how to protect the software so that it is not vulnerable.  The target audience is a senior-level Computer Science student, so you can assume an understanding of programming, databases, etc.

Each group will be marked according to the following rubric:

| Marks | Component                                                      |
| ----- | -------------------------------------------------------------- |
|     5 | Participation in the in-person presentation                    |
|     5 | Content quality in the slides                                  |

#### Choosing a Topic

Topics _must_ be unique.  To ensure this uniqueness, we will have a sign-up Google Sheet, and topics will be available on a first-come, first-served basis.  A list of suggested vulnerabilities is given below:

 - Clickjacking
 - Dangling markup
 - Parameter poisoning
 - CORS
 - CSP bypass
 - JWT (JSON Web Tokens)
 - Server-side template injection (SSTI)
 - Client-side template injection (CSTI)
 - CSV injection
 - LaTeX injection
 - HTML injection
 - CRLF injection
 - LDAP injection
 - Unicode injection
 - XPath injection
 - XML External Entity (XXE)
 - XSLT injection
 - Command injection
 - Log injection
 - Race condition
 - Reset Password bypass
 - 2FA bypass
 - Web socket attacks

You are welcome to choose another vulnerability if you like.  The vulnerability must be related to software development, however, to fit with this course.  No operating system, kernel, or network vulnerabilities will be accepted.  Binary exploits will also be accepted, but are not recommended here due to how late in the course these are introduced.  If you are in doubt as to whether your vulnerability is acceptable, you can ask the instructor, but do not wait until nearly the due date to do so!

### Option 1

This option is primarily for students wanting to be software developers, but could also be suitable for students who want to go into cybersecurity.

For this major project, the group will collaborate on a vulnerable web application which has one challenge/lab/bug (hereafter called 'bug') for each member of the group (or, alternatively, one capture-the-flag-like challenge for each group member).  The bug can be simulated or real.  Each bug must be documented with a full write-up (or video), which fully describes the process of exploiting that bug.  Each group member is responsible (and will be marked) for their own bug, although collaboration is allowed between group members.  Each bug will be implemented with three different levels:

1. The bug exists without any protections in place.
2. The bug exists with protections, which are bypassable using some of the techniques similar to those described in the lectures for other vulnerabilities.
3. The bug exists with protections, which fully eliminate the bug (i.e. it is not exploitable).

*Note: Not every vulnerability can fit within this three-level framework.  You can discuss with the instructor alternatives if you feel that it isn't suitable for the vulnerability that you have chosen.*

You do not need to provide any hints or suggestions within the application, but the application should let the user know when they have solved the bug.

*Note: At least one of the bugs must match the type of vulnerability covered in the presentation.  A list of suggested vulnerabilities is given in the above section, `Presentation`.*

*Note: If you use AI (or get help from somewhere else), please document this in your source code.  Code that you write on your own will be given more credit, so you may need to do a bit more if you are using AI or getting help to compensate.*

*Note: Ideally, the vulnerable web application will be deployed via a Docker image.  However, if that is beyond your skill level you can just submit the resulting web application in this GitHub repository, as long as there is a `HOW_TO_RUN.md` file that includes a complete description on how to run the application from scratch.  Similarly, the command to run the application within Docker should be provided in the `HOW_TO_RUN.md` file.*

For this option, the marking will be done according to the following rubrics:

Objective Evaluation for each team member:

| Marks | Component                                                      |
| ----- | -------------------------------------------------------------- |
|     5 | Write-up or walkthrough for one challenge for each team member |
|     5 | Challenge implementation/source code for each team member      |

Subjective Evaluation for each team member:

| Marks | Component                                                      |
| ----- | -------------------------------------------------------------- |
|    10 | Estimated work done with write-up or walkthrough               |
|    10 | Estimated work done with challenge implementation              |

*Note: Difficult vulnerabilities or implementations are considered more 'work done'.*

### Option 2

This option is for students aiming to be cybersecurity professionals.  The requirements are very similar to the requirements for major group project 1.  This will allow each student in the group to learn more about attacks and bypassing protections.  

In order to be as flexible as possible, the platform that each group will use has some degree of flexibility.  The list below is not intended to be an exhaustive list, but if you have any source of challenges related to this course that you may want to use for this project, contact the instructor for validation.  The following platforms would be a useful source of challenges for this project:

 - bWAPP (http://www.itsecgames.com/) `*`
 - PortSwigger Academy (https://portswigger.net/web-security/dashboard) `*`
 - OWASP Juice Shop (https://juice.science.ontariotechu.ca/balancer/)
 - DVWA (https://github.com/digininja/DVWA)
 - WebGoat (https://owasp.org/www-project-webgoat/)
 - Pico CTF (https://picoctf.org/)
 - another public, persistent Jeopardy-style CTF competition
 

*`*` -> Note: Any challenges done in the course of the lectures or labs is inadmissible as a challenge for this project.*

*Note: Any challenges done during the first project by any of the group members, is inadmissible as a challenge for this project.*

Each team member is required to solve a minimum of 8 challenges, and perform a comprehensive write-up for _exactly_ one of these challenges.  For the challenge where a write-up is being done, let's call this the focus challenge, be sure that what is submitted is a step-by-step guide on how to solve that challenge, such as would be useful for another student in this course (who is your intended audience).  If your walkthrough is pretty short, it is probably a sign that your challenge was too easy.  For the focus challenge, at least, it should describe a challenge that you could just barely complete.  We're trying to assess your skills, here.  Doing a warm-up challenge isn't a great way to do that.  A video walkthrough is an acceptable substitute for a write-up, but it must be limited to 10 minutes or less.  

For the other challenges, you can include a simple screenshot of your solution.

*Note: Challenges come in all different sizes and difficulty levels.  It won't be possible to give you a solid number of challenges that is sufficient.  8 is the minimum.  You need to do at least 8 individual challenges.  However, if the challenges are easy then you may need to do more to do enough.  You will need to use your judgement.  Aim for approximately 30 hours of work for each group member.*

Team members can collaborate on some challenges, and are encouraged to do so, but at least the challenge for the write-up should be done on your own with no direct technical assistance (only high-level guidance) from your teammates, other people, AI, etc.  You can consult others for the remaining challenges, and it is also acceptable to use AI to help as long as you did the bulk of the work solving the challenge.  All group members must solve different challenges.

*Note: At least one of the challenges must match the vulnerability covered in the presentation, and at least one example of this vulnerability should be the focus of a write-up.  A list of suggested vulnerabilities is given in the above section, `Presentation`.*

Instead of a write-up, you could also record a video of solving the challenge with explanation in voice-over.  In this case, put the video on YouTube (unlisted if you wish), and share the URL in a markdown file.

For this option, the marking will be done according to the following rubrics:

Objective Evaluation for each team member:

| Marks | Component                                                              |
| ----- | ---------------------------------------------------------------------- |
|     5 | Write-up or walkthrough for one challenge for each team member         |
|     5 | Proof of solving seven or more additional challenges (e.g. screenshot) |

Subjective Evaluation for each team member:

| Marks | Component                                                              |
| ----- | ---------------------------------------------------------------------- |
|    10 | Estimated work done with write-up or walkthrough                       |
|    10 | Estimated work done with additional challenges                         |

*Note: Difficult challenges are considered more 'work done'.*

## How to Submit

You will submit your project by every team member submitting their work to your copy of this repository on GitHub, and someone on the team submitting the GitHub URL to Canvas.  Be sure that the following is included:

 - fill out the table above with everyone's full name and GitHub username 
 - the presentation file (or a link to the presentation, if using a cloud-based slideshow)
 - walkthroughs can be PDFs, Markdown, or YouTube videos

Everyone can submit their work to the repository separately, and the commit logs will be used to investigate if all of the team members have contributed equally.  Only one team member should (and needs to) submit the GitHub URL to Canvas.
