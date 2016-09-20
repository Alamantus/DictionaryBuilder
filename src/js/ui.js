function Initialize() {
    LoadDictionary();
    ClearForm();
    LoadUserDictionaries();

    GetTextFile("/README.md", "aboutText", true);
    GetTextFile("/TERMS.md", "termsText", true);
    GetTextFile("/PRIVACY.md", "privacyText", true);
    GetTextFile("/LOGIN.form", "loginForm", false);
    GetTextFile("/FORGOT.form", "forgotForm", false);
    GetTextFile("/EXPORT.form", "exportForm", false);
    GetTextFile("/IMPORT.form", "importForm", false);

    SetKeyboardShortcuts();
    SetWindowListeners();
}

function SetKeyboardShortcuts() {
    document.addEventListener("keydown", function(e) {
        var keyCode = (e.which ? e.which : e.keyCode);

        if (keyCode == keyCodeFor("escape")) {
            if (document.getElementById("infoScreen").style.display == "block") {
                HideInfo();
            }
            else if (document.getElementById("fullScreenTextboxScreen").style.display == "block") {
                HideFullScreenTextbox();
            }
            else if (document.getElementById("settingsScreen").style.display == "block") {
                HideSettings();
            }
            else if (document.getElementById("accountSettingsScreen") && document.getElementById("accountSettingsScreen").style.display == "block") {
                HideAccountSettings();
            }
        }
        else if (e.ctrlKey) {
            // Only allow shortcuts if not currently using fullscreen textbox
            if (document.getElementById("fullScreenTextboxScreen").style.display == "none") {
                if (keyCode == keyCodeFor("m")) {
                    if (document.activeElement.id.indexOf("longDefinition") >= 0) {
                        e.preventDefault();
                        ShowFullScreenTextbox(document.activeElement.id, 'Explanation/Long Definition');
                    }
                    else if (document.activeElement.id == "dictionaryDescriptionEdit") {
                        e.preventDefault();
                        ShowFullScreenTextbox('dictionaryDescriptionEdit', 'Dictionary Details');
                    }
                    else if (document.activeElement.id == "fullScreenTextbox") {
                        e.preventDefault();
                        HideFullScreenTextbox();
                    }
                }
                else if (keyCode == keyCodeFor("u")) {
                    e.preventDefault();
                    ToggleWordFormLock();
                }
                else if (keyCode == keyCodeFor("d")) {
                    e.preventDefault();
                    ToggleDescription();
                }
                else if (keyCode == keyCodeFor("s")) {
                    e.preventDefault();
                    //ToggleSearchFilter();
                    var searchFilterToggle = document.getElementById("searchFilterToggle");
                    var searchFilterArea = document.getElementById("searchFilterArea");

                    if (searchFilterArea.style.display == "none") {
                        searchFilterArea.style.display = "block";
                        searchFilterToggle.innerHTML = "Hide Search/Filter Options";
                    }
                    document.getElementById("searchBox").focus();
                }
                else if (keyCode == keyCodeFor("h")) {
                    e.preventDefault();
                    ShowInfo('aboutText');
                }
            }
            else {  //If the fullscreen editor *is* open, just prevent the others for consistent behavior.
                if (keyCode == keyCodeFor("m")) {
                    e.preventDefault();
                    HideFullScreenTextbox();
                }
                else if (keyCode == keyCodeFor("u")) {
                    e.preventDefault();
                }
                else if (keyCode == keyCodeFor("d")) {
                    e.preventDefault();
                }
                else if (keyCode == keyCodeFor("s")) {
                    e.preventDefault();
                }
                else if (keyCode == keyCodeFor("h")) {
                    e.preventDefault();
                }
            }
        }
        else if (e.altKey) {
            // Only toggle screens if not currently using fullscreen textbox
            if (document.getElementById("fullScreenTextboxScreen").style.display == "none") {
                if (keyCode == keyCodeFor("s")) {
                    e.preventDefault();
                    ToggleSettingsScreen(true);
                }
                else if (keyCode == keyCodeFor("a")) {
                    e.preventDefault();
                    ToggleAccountSettings();
                }
            }
        }
    }, false);
}

function SetWindowListeners() {
    window.addEventListener("scroll", function() {
        var doc = document.documentElement;
        var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
        var dictionaryColumn = document.getElementById("dictionaryColumn");
        var wordPullout = document.getElementById("mobileWordFormPullout");

        if (top > dictionaryColumn.offsetTop) {
            wordPullout.style.display = "block";
        } else {
            wordPullout.style.display = "none";
            if (wordPullout.innerHTML != "+") {
                LockWordForm();
                wordPullout.innerHTML = "+";
            }
        }
    });
}

function SubmitWordOnCtrlEnter(keypress) {
    var keyCode = (event.which ? event.which : event.keyCode);

    if (keyCode === keyCodeFor("ctrlEnter") || (keyCode == keyCodeFor("enter") && event.ctrlKey)) { //Windows and Linux Chrome accept ctrl+enter as keyCode 10.
        event.preventDefault();

        if (/\d/.test(document.activeElement.id)) { // If there IS a number in the ID, then it is a word being edited.
            EditWord(document.activeElement.id.match(/\d+/)[0]);    // .match(/\d+/) returns an array of digits in a string.
        } else {    // Otherwise, it's a new word.
            AddWord();
        }
    }
}

function LoadUserDictionaries() {
    var getDictionariesRequest = new XMLHttpRequest();
    var userDictionariesSelect = document.getElementById("userDictionaries");
    if (userDictionariesSelect != null) {
        getDictionariesRequest.open('GET', "/php/ajax_dictionarymanagement.php?action=getall");
        getDictionariesRequest.onreadystatechange = function() {
            if (getDictionariesRequest.readyState == 4 && getDictionariesRequest.status == 200) {
                ParseUserDictionariesIntoSelect(userDictionariesSelect, getDictionariesRequest.responseText);
            }
        }
        getDictionariesRequest.send();
    }
}

function ParseUserDictionariesIntoSelect(selectToPopulate, dicitonaryList) {
    if (selectToPopulate.options.length > 0) {
        for (var i = selectToPopulate.options.length - 1; i >= 0; i--) {
            selectToPopulate.removeChild(selectToPopulate.options[i]);
        }
    }

    var dictionaries = dicitonaryList.split("_DICTIONARYSEPARATOR_");
    for (var j = 0; j < dictionaries.length - 1; j++) {
        var dictionaryOption = document.createElement('option');
        var dictionaryValues = dictionaries[j].split("_IDNAMESEPARATOR_");
        dictionaryOption.appendChild(document.createTextNode(htmlEntitiesParse(dictionaryValues[1])));
        dictionaryOption.value = dictionaryValues[0];
        selectToPopulate.appendChild(dictionaryOption);
    }
    selectToPopulate.value = (currentDictionary.externalID > 0) ? currentDictionary.externalID : "";
}

function GetTextFile(filename, variableName, parseMarkdown) {
    parseMarkdown = (typeof parseMarkdown !== 'undefined') ? parseMarkdown : false;
    var readmeFileRequest = new XMLHttpRequest();
    readmeFileRequest.open('GET', filename);
    readmeFileRequest.onreadystatechange = function() {
        if (readmeFileRequest.readyState == 4 && readmeFileRequest.status == 200) {
            window[variableName] = (parseMarkdown) ? marked(readmeFileRequest.responseText, {sanitize: false}) : readmeFileRequest.responseText;
        }
    }
    readmeFileRequest.send();
}

function ValidateLogin() {
    var errorMessage = document.getElementById("loginError");
    var emailValue = document.getElementById("loginEmailField").value;
    var passwordValue = document.getElementById("loginPasswordField").value;

    if (emailValue == "") {
        errorMessage.innerHTML = "Email cannot be blank!";
        return false;
    } else if (!(/[^\s@]+@[^\s@]+\.[^\s@]+/.test(emailValue))) {
        errorMessage.innerHTML = "Your email address looks fake. Email addresses look like this: name@email.com."
        return false;
    } else if (passwordValue == "") {
        errorMessage.innerHTML = "Password cannot be blank!";
        return false;
    } else {
        document.getElementById("loginForm").submit();
    }
}

function ValidateCreateAccount() {
    var errorMessage = document.getElementById("createAccountError");
    var emailValue = document.getElementById("createAccountEmailField").value;
    var passwordValue = document.getElementById("createAccountPasswordField").value;
    var passwordConfirmValue = document.getElementById("createAccountPasswordConfirmField").value;
    var publicNameValue = document.getElementById("createAccountPublicNameField").value;

    if (emailValue == "") {
        errorMessage.innerHTML = "Email cannot be blank!";
        return false;
    } else if (!(/[^\s@]+@[^\s@]+\.[^\s@]+/.test(emailValue))) {
        errorMessage.innerHTML = "Your email address looks fake. Email addresses look like this: name@email.com."
        return false;
    } else if (passwordValue == "") {
        errorMessage.innerHTML = "Password cannot be blank!";
        return false;
    } else if (passwordValue != passwordConfirmValue) {
        errorMessage.innerHTML = "Passwords do not match!";
        return false;
    } else if (publicNameValue == "") {
        errorMessage.innerHTML = "Public Name cannot be blank!";
        return false;
    } else {
        var emailCheck = new XMLHttpRequest();
        emailCheck.open('GET', "/php/ajax_createaccountemailcheck.php?email=" + emailValue);
        emailCheck.onreadystatechange = function() {
            if (emailCheck.readyState == 4 && emailCheck.status == 200) {
                if (emailCheck.responseText != "ok") {
                    errorMessage.innerHTML = "The email address entered is already being used. Try logging in or using a different email address instead.";
                    return false;
                } else {
                    document.getElementById("createAccountForm").submit();
                }
            }
        }
        emailCheck.send();
    }
}

function ValidateAccountSettings() {
    var errorMessage = document.getElementById("accountSettingsError");
    var emailValue = document.getElementById("accountSettingsEmailField").value;
    var publicNameValue = document.getElementById("accountSettingsPublicNameField").value;

    if (emailValue == "") {
        errorMessage.innerHTML = "Email cannot be blank!";
        return false;
    } else if (!(/[^\s@]+@[^\s@]+\.[^\s@]+/.test(emailValue))) {
        errorMessage.innerHTML = "Your email address looks fake. Email addresses look like this: name@email.com."
        return false;
    } else if (publicNameValue == "") {
        errorMessage.innerHTML = "Public Name cannot be blank!";
        return false;
    } else {
        document.getElementById("createAccountForm").submit();
    }
}

function ValidateForgotPassword() {
    var errorMessage = document.getElementById("forgotError");
    var emailValue = document.getElementById("forgotEmailField").value;

    if (emailValue == "") {
        errorMessage.innerHTML = "Email cannot be blank!";
        return false;
    } else if (!(/[^\s@]+@[^\s@]+\.[^\s@]+/.test(emailValue))) {
        errorMessage.innerHTML = "Your email address looks fake. Email addresses look like this: name@email.com."
        return false;
    } else {
        var emailCheck = new XMLHttpRequest();
        emailCheck.open('GET', "/php/ajax_passwordresetemailcheck.php?email=" + emailValue);
        emailCheck.onreadystatechange = function() {
            if (emailCheck.readyState == 4 && emailCheck.status == 200) {
                if (emailCheck.responseText != "email exists") {
                    errorMessage.innerHTML = "The email address entered is not in use and therefore can't have its password reset. Try <span class='clickable' onclick='ShowInfo(\"loginForm\")'>creating an account</span> instead!";
                    return false;
                } else {
                    document.getElementById("forgotForm").submit();
                }
            }
        }
        emailCheck.send();
    }
}

function ValidateResetPassword() {
    var errorMessage = document.getElementById("resetPasswordError");
    var passwordValue = document.getElementById("newPasswordField").value;
    var passwordConfirmValue = document.getElementById("newPasswordConfirmField").value;

    if (passwordValue == "") {
        errorMessage.innerHTML = "Password cannot be blank!";
        return false;
    } else if (passwordValue != passwordConfirmValue) {
        errorMessage.innerHTML = "Passwords do not match!";
        return false;
    } else {
        document.getElementById("resetPasswordForm").submit();
    }
}

function WarnEmailChange() {
    var emailChangeWarning = document.getElementById("accountSettingsEmailChangeWarning");
    var emailValue = document.getElementById("accountSettingsEmailField").value;
    var originalEmailValue = document.getElementById("accountSettingsPreviousEmailField").value;

    if (emailValue != originalEmailValue) {
        emailChangeWarning.style.display = "block";
    } else {
        emailChangeWarning.style.display = "none";
    }
}

function LoggedInResetPassword() {
    var resetPasswordRequest = new XMLHttpRequest();
    resetPasswordRequest.open('GET', "/php/ajax_setnewpassword.php");
    resetPasswordRequest.onreadystatechange = function() {
        if (resetPasswordRequest.readyState == 4 && resetPasswordRequest.status == 200) {
            if (resetPasswordRequest.responseText != "done") {
                console.log(resetPasswordRequest.responseText);
                alert("Error resetting password.\n\nTry again later.");
                return false;
            } else {
                window.location = "./";
            }
        }
    }
    resetPasswordRequest.send();
}

function ExplainPublicName() {
    alert("This is the name we greet you with. It's also the name displayed if you ever decide to share any of your dictionaries.\n\nNote: this is not a username, and as such is not guaranteed to be unique. Use something people will recognize you as to differentiate from other people who might use the same name!");
}

function ExplainAllowEmails() {
    alert("We'll make sure that you're the first to hear about any new features that get added or if any of our policies change for any reason. We'll never spam you or sell your information, but you may need to mark emails from lexicon.ga as not spam to receive them.\nNOTE: Password reset emails will be sent regardless of your choice.");
}

function wordFormIsLocked() {
    return document.getElementById("formLockButton").innerHTML == "\uD83D\uDD12";
}

function MobileToggleWordForm() {
    var pullout = document.getElementById("mobileWordFormPullout");
    ToggleWordFormLock("7%");
    if (pullout.innerHTML == "+") {
        pullout.innerHTML = "✕";
    } else {
        pullout.innerHTML = "+";
    }
}

function ToggleWordFormLock(topValue) {
    if (wordFormIsLocked()) {  //If it is already locked, change it to Unlocked and get everything working as it needs to.
        UnlockWordForm(topValue);
    } else {
        LockWordForm();
    }
}

function UnlockWordForm(topValue) {
    var lockButton = document.getElementById("formLockButton");
    var leftColumn = document.getElementById("leftColumn");
    var wordForm = document.getElementById("wordEntryForm");
    var wordFormWidth = wordForm.offsetWidth;
    var leftColumnWidth = leftColumn.offsetWidth;
    var leftColumnHeight = leftColumn.offsetHeight;

    lockButton.innerHTML = "&#128275;"; // Change to the "Unlocked lock" icon.

    wordForm.style.position = "fixed";
    wordForm.style.top = (typeof topValue !== 'undefined') ? topValue : document.getElementById("dictionaryColumn").offsetTop.toString() + "px";
    wordForm.style.width = wordFormWidth.toString() + "px";

    leftColumn.style.width = leftColumnWidth.toString() + "px";
    leftColumn.style.height = leftColumnHeight.toString() + "px";
}

function LockWordForm() {
    var lockButton = document.getElementById("formLockButton");
    var leftColumn = document.getElementById("leftColumn");
    var wordForm = document.getElementById("wordEntryForm");

    lockButton.innerHTML = "&#128274;"; // Change to the "locked" icon.
    leftColumn.removeAttribute('style');
    wordForm.removeAttribute('style');
}

function CloseUpdateConflictArea(wordIndexString) {// displayId, hideId) {
    // displayId = (typeof displayId !== 'undefined' && displayId != null) ? displayId : false;
    // if (displayId != false) {
    if (wordIndexString == "") {
        document.getElementById("newWordButtonArea").style.display = "block";
    } else {
        document.getElementById("editWordButtonArea" + wordIndexString).style.display = "block";
    }
    // }
    document.getElementById("updateConflict" + wordIndexString).style.display = "none";
    EnableForm(wordIndexString);
}

function DisableForm(wordIndexString) {
    document.getElementById("word" + wordIndexString).disabled = true;
    document.getElementById("pronunciation" + wordIndexString).disabled = true;
    document.getElementById("partOfSpeech" + wordIndexString).disabled = true;
    document.getElementById("simpleDefinition" + wordIndexString).disabled = true;
    document.getElementById("longDefinition" + wordIndexString).disabled = true;
}

function EnableForm(wordIndexString) {
    document.getElementById("word" + wordIndexString).disabled = false;
    document.getElementById("pronunciation" + wordIndexString).disabled = false;
    document.getElementById("partOfSpeech" + wordIndexString).disabled = false;
    document.getElementById("simpleDefinition" + wordIndexString).disabled = false;
    document.getElementById("longDefinition" + wordIndexString).disabled = false;
    // document.getElementById("editIndex").disabled = false;
}

function ClearForm() {
    if (document.getElementById("wordEntryForm")) {
        document.getElementById("word").value = "";
        document.getElementById("pronunciation").value = "";
        document.getElementById("partOfSpeech").value = "";
        document.getElementById("simpleDefinition").value = "";
        document.getElementById("longDefinition").value = "";
        document.getElementById("editIndex").value = "";

        document.getElementById("newWordButtonArea").style.display = "block";
        document.getElementById("editWordButtonArea").style.display = "none";
        document.getElementById("errorMessage").innerHTML = "";
        document.getElementById("updateConflict").style.display = "none";
        EnableForm("");
    }
}

function ToggleDescription() {
    var descriptionToggle = document.getElementById("descriptionToggle");
    var descriptionArea = document.getElementById("dictionaryDescription");

    if (descriptionArea.style.display == "none") {
        descriptionArea.style.display = "block";
        descriptionToggle.innerHTML = "Hide Description";
    } else {
        descriptionArea.style.display = "none";
        descriptionToggle.innerHTML = "Show Description";
    }
}

function ToggleSearchFilter() {
    var searchFilterToggle = document.getElementById("searchFilterToggle");
    var searchFilterArea = document.getElementById("searchFilterArea");

    if (searchFilterArea.style.display == "none") {
        searchFilterArea.style.display = "block";
        searchFilterToggle.innerHTML = "Hide Search/Filter Options";
    } else {
        searchFilterArea.style.display = "none";
        searchFilterToggle.innerHTML = "Search/Filter Options";
    }
}

function ShowInfo(variableName) {
    ShowInfoWithText(window[variableName]);
    if (variableName == "loginForm") {
        // document.getElementById("infoText").innerHTML = loginForm;
        if (currentDictionary.words.length > 0 || currentDictionary.name != "New" || currentDictionary.description != "A new dictionary.") {
            document.getElementById("dictionaryWarn").innerHTML = "If your current dictionary is not already saved to your account, be sure to <span class='exportWarnText' onclick='ExportDictionary()'>export it before logging in</span> so you don't lose anything!";
        }
    }
}

function ShowInfoWithText(text) {
    document.getElementById("infoText").innerHTML = text;
    document.getElementById("infoScreen").style.display = "block";
    document.getElementById("infoPage").scrollTop = 0;
    HideAccountSettings();
}

function HideInfo() {
    document.getElementById("infoScreen").style.display = "none";
}

function ToggleAccountSettings() {
    if (document.getElementById("accountSettingsScreen")) {
        var accountScreen = document.getElementById("accountSettingsScreen");

        if (accountScreen.style.display == "block") {
            HideAccountSettings();
        } else {
            ShowAccountSettings();
        }
    }
}

function ShowAccountSettings(variableName) {
    if (document.getElementById("accountSettingsScreen"))
        document.getElementById("accountSettingsScreen").style.display = "block";

    HideInfo();
}

function HideAccountSettings() {
    if (document.getElementById("accountSettingsScreen"))
        document.getElementById("accountSettingsScreen").style.display = "none";
}

function ToggleSettingsScreen(doSave) {
    var settingsScreen = document.getElementById("settingsScreen");

    if (settingsScreen.style.display == "block") {
        if (doSave) {
            SaveSettings();
        }
        HideSettings();
    } else {
        ShowSettings();
    }
}

function ShowSettings() {
    document.getElementById("settingsScreen").style.display = "block";
    document.getElementById("dictionaryNameEdit").value = htmlEntitiesParse(currentDictionary.name);
    document.getElementById("dictionaryDescriptionEdit").value = htmlEntitiesParse(currentDictionary.description);
    document.getElementById("dictionaryPartsOfSpeechEdit").value = htmlEntitiesParse(currentDictionary.settings.partsOfSpeech);
    document.getElementById("dictionaryAllowDuplicates").checked = currentDictionary.settings.allowDuplicates;
    document.getElementById("dictionaryCaseSensitive").checked = currentDictionary.settings.caseSensitive;
    document.getElementById("dictionarySortByEquivalent").checked = currentDictionary.settings.sortByEquivalent;
    document.getElementById("dictionaryIsComplete").checked = currentDictionary.settings.isComplete;
    if (document.getElementById("dictionaryIsPublic")) {
        document.getElementById("dictionaryIsPublic").checked = currentDictionary.settings.isPublic;
        TogglePublicLink();
    }
    document.getElementById("numberOfWordsInDictionary").innerHTML = currentDictionary.words.length.toString();
}

function HideSettings() {
    document.getElementById("settingsScreen").style.display = "none";
    if (currentDictionary.settings.isComplete) {
        LockWordForm();
        document.getElementById("wordEntryForm").style.display = "none";
    } else {
        document.getElementById("wordEntryForm").style.display = "block";
    }

}

function HideSettingsWhenComplete() {
    if (document.getElementById("settingsScreen")) {
        if (currentDictionary.settings.isComplete) {
            document.getElementById("hideIfComplete").style.display = "none";
        } else {
            document.getElementById("hideIfComplete").style.display = "block";
        }
    }
}

function ShowFullScreenTextbox(textboxToExpandId, labelText) {
    var sourceTextboxElement = document.getElementById(textboxToExpandId);
    var targetTextboxElement = document.getElementById("fullScreenTextbox");
    document.getElementById("fullScreenTextboxLabel").innerHTML = labelText;
    var selection = getInputSelection(sourceTextboxElement);

    document.getElementById("expandedTextboxId").innerHTML = textboxToExpandId;
    targetTextboxElement.value = sourceTextboxElement.value;
    document.getElementById("fullScreenTextboxScreen").style.display = "block";

    setSelectionRange(targetTextboxElement, selection.start, selection.end);
}

function HideFullScreenTextbox() {
    var expandedTextboxId = document.getElementById("expandedTextboxId").innerHTML;
    var sourceTextboxElement = document.getElementById("fullScreenTextbox");
    var targetTextboxElement = document.getElementById(expandedTextboxId);
    var selection = getInputSelection(sourceTextboxElement);

    targetTextboxElement.value = sourceTextboxElement.value;
    document.getElementById("fullScreenTextboxScreen").style.display = "none";

    setSelectionRange(targetTextboxElement, selection.start, selection.end);
}

function ShowDictionaryDeleteMenu(dictionaryList) {
    document.getElementById('loadAfterDeleteScreen').style.display = 'block';
    //Parse response into the list that forces you to load one and reload select in settings.
    ParseUserDictionariesIntoSelect(document.getElementById("loadAfterDelete"), dictionaryList);
    ParseUserDictionariesIntoSelect(document.getElementById("userDictionaries"), dictionaryList);
}

function ToggleCaseSensitiveOption() {
    if (document.getElementById("dictionaryAllowDuplicates").checked) {
        document.getElementById("dictionaryCaseSensitive").disabled = true;
    } else {
        document.getElementById("dictionaryCaseSensitive").disabled = false;
    }
}

function TogglePublicLink() {
    if (document.getElementById("dictionaryIsPublic").checked) {
        var publicLink = "http://lexicon.ga/" + currentDictionary.externalID;
        document.getElementById("publicLink").innerHTML = "<strong>Public Link:</strong><br>" + publicLink;
    } else {
        document.getElementById("publicLink").innerHTML = "";
    }
}

function SetPartsOfSpeech (selectId) {
    selectId = (typeof selectId !== 'undefined') ? selectId : "partOfSpeech";
    var partsOfSpeechSelect = document.getElementById(selectId);

    var wordFilterOptions = document.getElementById("filterOptions");
    var wordFiltersSelected = GetSelectedFilters();

    // Clear parts of speech.
    partsOfSpeechSelect.innerHTML = "";
    wordFilterOptions.innerHTML = "";

    // Insert blank part of speech as first dropdown option.
    var blankpartOfSpeechOption = document.createElement('option');
    blankpartOfSpeechOption.appendChild(document.createTextNode(""));
    blankpartOfSpeechOption.value = " ";
    partsOfSpeechSelect.appendChild(blankpartOfSpeechOption);

    // Rebuild parts of speech
    var newPartsOfSpeech = htmlEntitiesParse(currentDictionary.settings.partsOfSpeech).trim().split(",");
    for (var j = 0; j < newPartsOfSpeech.length; j++) {
        var thePartOfSpeech = newPartsOfSpeech[j].trim();

        var partOfSpeechOption = document.createElement('option');
        partOfSpeechOption.appendChild(document.createTextNode(thePartOfSpeech));
        partOfSpeechOption.value = thePartOfSpeech;
        partsOfSpeechSelect.appendChild(partOfSpeechOption);

        var wordFilterLabel = document.createElement('label');
        wordFilterLabel.appendChild(document.createTextNode(thePartOfSpeech + " "));
        wordFilterLabel['part-of-speech'] = thePartOfSpeech;
        wordFilterLabel.className = 'filterOption';
        var wordFilterCheckbox = document.createElement('input');
        wordFilterCheckbox.type = 'checkbox';
        wordFilterCheckbox.onchange = function(){ShowDictionary()};
        if (wordFiltersSelected.indexOf(thePartOfSpeech) > -1) wordFilterCheckbox.checked = true;
        wordFilterLabel.appendChild(wordFilterCheckbox);
        wordFilterOptions.appendChild(wordFilterLabel);
    }

    // Insert blank part of speech as last filter option
    var blankwordFilterLabel = document.createElement('label');
    blankwordFilterLabel.appendChild(document.createTextNode("Blanks "));
    blankwordFilterLabel['part-of-speech'] = " ";
    blankwordFilterLabel.className = 'filterOption';
    var blankwordFilterCheckbox = document.createElement('input');
    blankwordFilterCheckbox.type = 'checkbox';
    blankwordFilterCheckbox.onchange = function(){ShowDictionary()};
    if (wordFiltersSelected.indexOf(" ") > -1) blankwordFilterCheckbox.checked = true;
    blankwordFilterLabel.appendChild(blankwordFilterCheckbox);
    wordFilterOptions.appendChild(blankwordFilterLabel);
}

function GetSelectedFilters() {
    var wordFilterOptions = document.getElementById("filterOptions");
    var wordFiltersSelected = [];

    for (var i = 0; i < wordFilterOptions.children.length; i++) {
        var filterOption = wordFilterOptions.children[i];
        if (filterOption.children[0].checked) {
            wordFiltersSelected.push(filterOption['part-of-speech']);
        }
    }

    return wordFiltersSelected;
}

function ToggleAllFilters(doCheck) {
    var wordFilterOptions = document.getElementById("filterOptions");

    for (var i = 0; i < wordFilterOptions.children.length; i++) {
        wordFilterOptions.children[i].children[0].checked = doCheck;
    }
}

function ShowFilterWordCount(numberOfWords) {
    var filters = GetSelectedFilters();
    var search = htmlEntitiesParseForSearchEntry(document.getElementById("searchBox").value);
    var wordCounter = document.getElementById("filterWordCount");

    if (filters.length > 0 || search != "") {
        wordCounter.innerHTML = "Showing " + numberOfWords.toString() + " result" + ((numberOfWords != 1) ? "s" : "");
    } else {
        wordCounter.innerHTML = "";
    }
}

function NewWordNotification(word) {
    var wordId = currentDictionary.nextWordId - 1;
    NewNotification("New Word Added: <a href='#" + wordId.toString() + "'>" + word + "</a>");
}

function NewNotification(message) {
    var notificationArea = document.getElementById("notificationArea");
    var notificationMessage = document.getElementById("notificationMessage");
    notificationArea.style.display = "block";
    notificationMessage.innerHTML = message;
}

function FocusAfterAddingNewWord() {
    document.getElementById("word").focus();
}
