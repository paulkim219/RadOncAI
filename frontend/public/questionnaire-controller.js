(function () {
  "use strict";

  angular.module("radOncAIApp").controller("QuestionnaireController", ['$scope', QuestionnaireController]);

  function QuestionnaireController($scope) {
    var vm = this;

    // Initialize questionnaire structure
    var savedQuestionnaire = localStorage.getItem('radOncQuestionnaire');
    vm.questionnaire = savedQuestionnaire ? JSON.parse(savedQuestionnaire) : {
      title: "Radiation Oncology Questionnaire",
      description: "A questionnaire built through chat interaction",
      questions: []
    };

    // Initialize chat history
    var savedChat = localStorage.getItem('radOncQuestionnaireChat');
    vm.chatHistory = savedChat ? JSON.parse(savedChat) : [];
    
    vm.questionInput = "";
    vm.isLoading = false;

    // Computed property for JSON display
    vm.updateJSON = function() {
      vm.questionnaireJSON = JSON.stringify(vm.questionnaire, null, 2);
      localStorage.setItem('radOncQuestionnaire', JSON.stringify(vm.questionnaire));
    };

    $scope.$watch(function() { return vm.questionnaire; }, function(newVal) {
      if (newVal) {
        vm.updateJSON();
      }
    }, true);

    // Initialize JSON display
    vm.updateJSON();

    vm.sendQuestion = function sendQuestion() {
      if (!vm.questionInput.trim()) return;

      var userMessage = vm.questionInput.trim();
      vm.chatHistory.push({
        role: "user",
        message: userMessage
      });

      vm.questionInput = "";
      vm.isLoading = true;
      localStorage.setItem('radOncQuestionnaireChat', JSON.stringify(vm.chatHistory));

      // Parse the question from user input
      setTimeout(function() {
        var question = vm.parseQuestion(userMessage);
        
        if (question) {
          vm.questionnaire.questions.push(question);
          vm.chatHistory.push({
            role: "system",
            message: "Question added successfully: " + question.text,
            questionAdded: true
          });
        } else {
          vm.chatHistory.push({
            role: "system",
            message: "I couldn't parse that question. Please try a format like: 'Add a multiple choice question: [your question] with options: [option1], [option2], [option3]'"
          });
        }

        $scope.$apply(function() {
          vm.isLoading = false;
          localStorage.setItem('radOncQuestionnaireChat', JSON.stringify(vm.chatHistory));
        });
      }, 500);
    };

    vm.parseQuestion = function parseQuestion(input) {
      input = input.toLowerCase().trim();
      
      var question = {
        id: "q" + (vm.questionnaire.questions.length + 1),
        text: "",
        type: "text",
        required: true
      };

      // Parse multiple choice questions
      if (input.includes("multiple choice") || input.includes("mcq") || input.includes("choice")) {
        question.type = "choice";
        question.options = [];
        
        // Extract question text
        var questionMatch = input.match(/(?:question|add|create)[\s:]+(.+?)(?:with options|options|choices)/i);
        if (!questionMatch) {
          questionMatch = input.match(/:(.+?)(?:with options|options|choices)/i);
        }
        if (!questionMatch) {
          questionMatch = input.match(/(?:multiple choice|mcq|choice)[\s:]+(.+?)(?:with|$)/i);
        }
        
        if (questionMatch) {
          question.text = questionMatch[1].trim();
        } else {
          // Try to extract from the beginning
          var parts = input.split(/with options|options|choices/i);
          if (parts.length > 0) {
            question.text = parts[0].replace(/^(add|create|multiple choice|mcq|choice)[\s:]+/i, "").trim();
          }
        }

        // Extract options
        var optionsMatch = input.match(/(?:with options|options|choices)[\s:]+(.+)/i);
        if (optionsMatch) {
          var optionsText = optionsMatch[1];
          question.options = optionsText.split(/[,;]|and/i).map(function(opt) {
            return opt.trim();
          }).filter(function(opt) {
            return opt.length > 0;
          });
        }

        // If no options found, create default ones
        if (question.options.length === 0) {
          question.options = ["Option 1", "Option 2", "Option 3"];
        }
      }
      // Parse yes/no questions
      else if (input.includes("yes/no") || input.includes("yes or no") || input.includes("boolean")) {
        question.type = "boolean";
        question.options = ["Yes", "No"];
        
        var questionMatch = input.match(/(?:question|add|create)[\s:]+(.+?)(?:yes|no|$)/i);
        if (!questionMatch) {
          questionMatch = input.match(/:(.+?)(?:yes|no|$)/i);
        }
        if (questionMatch) {
          question.text = questionMatch[1].replace(/(yes\/no|yes or no|boolean)/i, "").trim();
        } else {
          question.text = input.replace(/(add|create|yes\/no|yes or no|boolean)[\s:]+/i, "").trim();
        }
      }
      // Parse number questions
      else if (input.includes("number") || input.includes("numeric")) {
        question.type = "integer";
        
        var questionMatch = input.match(/(?:question|add|create)[\s:]+(.+?)(?:number|numeric|$)/i);
        if (!questionMatch) {
          questionMatch = input.match(/:(.+?)(?:number|numeric|$)/i);
        }
        if (questionMatch) {
          question.text = questionMatch[1].replace(/(number|numeric)/i, "").trim();
        } else {
          question.text = input.replace(/(add|create|number|numeric)[\s:]+/i, "").trim();
        }
      }
      // Default to text question
      else {
        question.type = "text";
        
        // Extract question text
        var questionMatch = input.match(/(?:question|add|create|text)[\s:]+(.+)/i);
        if (questionMatch) {
          question.text = questionMatch[1].trim();
        } else {
          // Try to find text after common prefixes
          question.text = input.replace(/(add|create|text question)[\s:]+/i, "").trim();
        }
      }

      // Clean up question text
      question.text = question.text.replace(/^(a|an|the)\s+/i, "").trim();
      
      // If we still don't have a question, try to use the whole input
      if (!question.text || question.text.length < 3) {
        question.text = input.replace(/(add|create|question|multiple choice|mcq|yes\/no|number|text)[\s:]+/i, "").trim();
      }

      // Only return question if we have valid text
      if (question.text && question.text.length >= 3) {
        return question;
      }
      
      return null;
    };

    vm.handleQuestionKeydown = function(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        vm.sendQuestion();
      }
    };

    vm.resetChat = function resetChat() {
      vm.chatHistory = [];
      localStorage.removeItem('radOncQuestionnaireChat');
    };

    vm.clearQuestionnaire = function clearQuestionnaire() {
      if (confirm("Are you sure you want to clear the entire questionnaire?")) {
        vm.questionnaire = {
          title: "Radiation Oncology Questionnaire",
          description: "A questionnaire built through chat interaction",
          questions: []
        };
        vm.chatHistory = [];
        localStorage.removeItem('radOncQuestionnaire');
        localStorage.removeItem('radOncQuestionnaireChat');
      }
    };

    vm.deleteQuestion = function deleteQuestion(index) {
      if (index >= 0 && index < vm.questionnaire.questions.length) {
        var deletedQuestion = vm.questionnaire.questions[index];
        vm.questionnaire.questions.splice(index, 1);
        
        // Reassign IDs to maintain sequential order
        vm.questionnaire.questions.forEach(function(q, idx) {
          q.id = "q" + (idx + 1);
        });
        
        // Add message to chat history
        vm.chatHistory.push({
          role: "system",
          message: "Question deleted: " + deletedQuestion.text,
          questionDeleted: true
        });
        localStorage.setItem('radOncQuestionnaireChat', JSON.stringify(vm.chatHistory));
        
        // Update JSON
        vm.updateJSON();
      }
    };

    vm.downloadJSON = function downloadJSON() {
      var dataStr = JSON.stringify(vm.questionnaire, null, 2);
      var dataBlob = new Blob([dataStr], { type: 'application/json' });
      var url = URL.createObjectURL(dataBlob);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'questionnaire.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
  }
})();

