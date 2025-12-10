(function () {
  "use strict";

  angular.module("radOncAIApp", ['ui.bootstrap']).controller("ExamController", ['$interval', '$scope', ExamController]);

  function ExamController($interval, $scope) {
    var vm = this;

    // --- 1. LOAD MEMORY (MOVED TO TOP) ---
    // We do this FIRST so the rest of the app uses the saved data
    var savedHistory = localStorage.getItem('radOncChatHistory');
    var savedState = localStorage.getItem('radOncChatOpen');

    // FIX 1: Set these ONCE. Do not reset them to [] or false later.
    vm.chatHistory = savedHistory ? JSON.parse(savedHistory) : [];
    vm.isChatOpen = savedState === 'true'; 

    // For student chat
    var savedAnswer = localStorage.getItem('radOncAnswer');
    vm.answerHistory = savedAnswer ? JSON.parse(savedAnswer) : [];

    // --- CONFIGURATION ---
    vm.currentQuestion = "A sample question about Radiation Oncology guidelines";

    // FIX 2: Removed 'vm.chatHistory = []' from here (it was erasing your data)
    
    vm.answer = "";
    vm.chatMessage = "";
    vm.showHints = false;
    vm.showRating = false;
    vm.isLoading = false;
    vm.rating = { score: null, notes: "" };
    vm.ratingSummary = "Awaiting your response to generate targeted feedback.";

    vm.elapsed = 0;
    var timer = $interval(function () {
      vm.elapsed += 1000;
    }, 1000);

    vm.toggleHints = function toggleHints() {
      vm.showHints = !vm.showHints;
    };

    vm.sendChatMessage = async function sendChatMessage() {
      if (!vm.chatMessage.trim()) return;

      vm.chatHistory.push({
        role: "candidate",
        message: vm.chatMessage.trim(),
      });

      var currentChatMessage = vm.chatMessage; 
      vm.chatMessage = ""; 
      vm.isLoading = true; 
        
      // SAVE after user types
      localStorage.setItem('radOncChatHistory', JSON.stringify(vm.chatHistory));

      try {
        // Note: Removed API_KEY argument since the backend handles it now
        var aiResponse = await buildFollowUp(currentChatMessage);

        $scope.$apply(function() {
            vm.isLoading = false; 
            vm.chatHistory.push({
                role: "examiner",
                message: aiResponse,
            });
            // SAVE after AI replies
            localStorage.setItem('radOncChatHistory', JSON.stringify(vm.chatHistory));
            vm.openRating();
        });

      } catch (error) {
         console.error(error);
         $scope.$apply(function() {
             vm.isLoading = false; 
             vm.answerHistory.push({ role: "examiner", message: "Error contacting AI." });
         });
      }
    };

    vm.sendAnswer = async function sendAnswer() {
      if (!vm.answer.trim()) return;

      vm.answerHistory.push({
        role: "candidate",
        message: vm.answer.trim(),
      });

      var currentAnswer = vm.answer; 
      vm.answer = ""; 
      vm.isLoading = true; 
        
      // SAVE after user types
      localStorage.setItem('radOncAnswer', JSON.stringify(vm.answerHistory));

      try {
        // Note: Removed API_KEY argument since the backend handles it now
        var aiResponse = await buildFollowUp(currentAnswer);

        $scope.$apply(function() {
            vm.isLoading = false; 
            vm.answerHistory.push({
                role: "examiner",
                message: aiResponse,
            });
            // SAVE after AI replies
            localStorage.setItem('radOncAnswer', JSON.stringify(vm.answerHistory));
            vm.openRating();
        });

      } catch (error) {
         console.error(error);
         $scope.$apply(function() {
             vm.isLoading = false; 
             vm.answerHistory.push({ role: "examiner", message: "Error contacting AI." });
         });
      }
    };

    vm.handleAnswerKeydown = function(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        vm.sendAnswer();
      }
    };

    vm.handleChatKeydown = function(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        vm.sendChatMessage();
      }
    };

    vm.isOnPage = function(pageName) {
      return window.location.pathname.indexOf(pageName) !== -1;
    };
    
    // FIX 3: Removed 'vm.isChatOpen = false' from here (it was overwriting the saved state)

    vm.toggleChat = function() {
        vm.isChatOpen = !vm.isChatOpen;
        localStorage.setItem('radOncChatOpen', vm.isChatOpen);
        
        if (vm.isChatOpen) {
            setTimeout(function() {
                var chatBody = document.querySelector('.chat-body');
                if(chatBody) chatBody.scrollTop = chatBody.scrollHeight;
            }, 50);
        }
    };

    vm.openRating = function openRating() {
      vm.showRating = true;
    };

    vm.closeRating = function closeRating() {
      vm.showRating = false;
    };

    vm.submitRating = function submitRating() {
      vm.ratingSummary = summarize(vm.rating.score, vm.rating.notes);
      vm.closeRating();
    };

    vm.resetSession = function resetSession() {
      vm.chatHistory = [];
      vm.answerHistory = [];
      vm.answer = "";
      vm.rating = { score: null, notes: "" };
      vm.ratingSummary = "Awaiting your response to generate targeted feedback.";
      vm.showRating = false;
      vm.elapsed = 0;
      
      // Clear memory on reset
      localStorage.removeItem('radOncChatHistory');
      localStorage.removeItem('radOncAnswer');
    };

    vm.$onDestroy = function onDestroy() {
      $interval.cancel(timer);
    };
  }


  async function buildFollowUp(answer) {
    console.log("Sending to backend:", answer);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: answer })
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      return data.reply;

    } catch (error) {
      console.error('Detailed Debug Error:', error.message);
      return "I'm sorry, I couldn't reach the server.";
    }
  }

  function summarize(score, notes) {
    var base = score ? "You self-rated this response a " + score + "/5." : "No score recorded yet.";
    var noteSummary = notes ? " Notes: " + notes : " Add notes for actionable next steps.";
    return base + noteSummary;
  }
})();