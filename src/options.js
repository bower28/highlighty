/* Highlighty.js v1.0 | by Stephen Wu | MIT License */

$(function() {

  const HL_STYLE_ID = "HighlighterStyles"; // Style block containing highlighter styles

  function setupOptionsPage(options) {
    removeExistingListStyles();
    setupPrimarySettings(options);
    addExistingListStyles(options);
    addExistingLists(options);
  }

  // Setup primary settings (mouseover, etc.)
  function setupPrimarySettings(options) {
    $("#Settings__enableTitleMouseover").attr('checked', options.enabletitleMouseover);
    $("#Settings__keyboardShortcut").val(options.keyboardShortcut);
  }

  function removeExistingListStyles() {
    $('.' + HL_STYLE_ID).remove();
  }

  function addExistingListStyles(options) {
    let highlighterStyles =
        `<style id="${HL_STYLE_ID}">span.PhraseList__phrase { ${options.baseStyles} }\r\n`;
    for (let i = 0; i < options.highlighter.length; i++) {
      if (Object.keys(options.highlighter[i]).length) { // Skip deleted lists!
        let highlighterColor = ("color" in options.highlighter[i]) ? options.highlighter[i].color : "black";
        highlighterStyles += `span.PhraseList__phrase--from${i} { background-color: ${highlighterColor} }\r\n`;
      }
    }
    highlighterStyles += "</style>";
    $("head").append(highlighterStyles);
  }

  function addExistingLists(options) {
    for (let i = 0; i < options.highlighter.length; i++) {
      if (Object.keys(options.highlighter[i]).length) {
        let $newListDiv = $("#PhraseList--invisible")
            .clone()
            .attr('id', `PhraseList--${i}`)
            .data('index', i);
        $newListDiv.find(".PhraseList__title").html(options.highlighter[i].title);
        for (let j = 0; j < options.highlighter[i].phrases.length; j++) {
          addPhrase($newListDiv, options.highlighter[i].phrases[j], i, j);
        }
        $newListDiv.insertBefore("#NewPhraseList");
        setupPhraseListHandlers($newListDiv);
      }
    }
  }

  function addPhrase($listDiv, phrase, listIndex, phraseIndex) {
    if (phraseIndex == undefined) {
      phraseIndex = $listDiv.find(".PhraseList__phrases").length;
    }
    $listDiv.find(".PhraseList__phrases").append(
      `<span class="tag is-medium PhraseList__phrase PhraseList__phrase--from${listIndex}"` +
           ` data-list="${listIndex}" data-index="${phraseIndex}">` +
          phrase +
          `<button class="delete is-small PhraseList__phrase__delete"></button>` +
      `</span>`
    );
  }

  function setupPhraseListHandlers(list) {
    setupPhraseListEditNameHandler(list);
    setupPhraseListDeleteHandler(list);
    setupPhraseListAddPhraseHandler(list);
  }

  function setupPhraseListEditNameHandler(list) {
    list.on("click", ".PhraseList__editName", function() {
      var oldListName = list.find(".PhraseList__title").text();
      var newListName = window.prompt("Please enter a new phrase list name", oldListName);
      if (newListName != null && newListName != "" && newListName != oldListName) {
        chrome.storage.local.get(function(options) { // TODO: functionalize this?
          options.highlighter[list.data("index")].title = newListName;
          chrome.storage.local.set({"highlighter": options.highlighter }, function() {
            list.find(".PhraseList__title").text(newListName); // TODO: This is safe, right?
          });
        });
      }
    });
  }

  function setupPhraseListDeleteHandler(list) {
    list.on("click", ".PhraseList__delete", function() {
      var oldListName = list.find(".PhraseList__title").text();
      if (window.confirm(`Are you sure you want to delete ${oldListName}?`)) {
        chrome.storage.local.get(function(options) {
          options.highlighter[list.data("index")] = {};
          chrome.storage.local.set({"highlighter": options.highlighter }, function() {
            list.remove();
          });
        });
      }
    });
  }

  function setupPhraseListAddPhraseHandler($list) {
    let listIndex = $list.data("index");
    $list.on("click", ".PhraseList__newPhrase__add", function(e) {
      e.preventDefault();
      let newPhrase = $list.find(".PhraseList__newPhrase__phrase").val();
      if (newPhrase.length > 0) {
        chrome.storage.local.get(function(options) {
          if (options.highlighter[listIndex].phrases.includes(newPhrase)) {
            $list.find(".PhraseList__newPhrase__phrase").val("");
            alert("Phrase was already in list!")
          } else {
            options.highlighter[listIndex].phrases.push(newPhrase);
            $list.find(".PhraseList__newPhrase__phrase").val("");
            chrome.storage.local.set({"highlighter": options.highlighter }, function() {
              addPhrase($list, newPhrase, listIndex);
              alert("Phrase added!");
            });
          }
        });
      }
    });
  }

  chrome.storage.local.get(function(options) {
    setupOptionsPage(options);
  });

  $("#Settings__save").on("click", function(e) {
    let newKeyboardShortcut = $("#Settings__keyboardShortcut").val();
    let newEnableTitleMouseover = $("#Settings__enableTitleMouseover").is(":checked");
    chrome.storage.local.set(
      {
        "keyboardShortcut": newKeyboardShortcut,
        "enabletitleMouseover": newEnableTitleMouseover
      },
      function() {
        alert("Settings saved!");
      });
  });
});
