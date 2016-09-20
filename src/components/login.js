<div class="settingsCol"><form id="loginForm" method="post" action="?login">
    <h2>Log In</h2>
    <label><span>Email</span>
        <input type="email" id="loginEmailField" name="email" />
    </label>
    <label><span>Password</span>
        <input type="password" id="loginPasswordField" name="password" />
    </label>
    <div id="loginError" style="font-weight:bold;color:red;"></div>
    <button type="submit" id="loginSubmitButton" onclick="ValidateLogin(); return false;">Log In</button>
    <div id="dictionaryWarn" style="margin-bottom: 5px;"></div>
    <span id="forgotPassword" class="clickable" onclick="ShowInfo('forgotForm')" style="margin-top:20px;">Forgot Password?</span>
</form></div>
<div class="settingsCol"><form id="createAccountForm" method="post" action="?createaccount">
    <h2>Create a New Account</h2>
    <p style="font-size: 12px;">Creating an account allows you to save and switch between as many dictionaries as you need and access them from any device for free! If you have a dictionary you've been working on loaded already, it will automatically be uploaded to your account when you log in for the first time.</p>
    <p style="font-size: 12px;">Plus if you allow us to send you emails, we'll make sure that you're the first to hear about any new features that get added or if any of our policies change for any  reason. We'll never spam you or sell your information.</p>
    <p style="font-size: 12px;">By creating an account, you are indicating that you agree to the <span class="clickable inline-button" onclick="ShowInfo('termsText')">Terms of Service</span> and that you understand Lexiconga's <span class="clickable inline-button" onclick="ShowInfo('privacyText')">Privacy Policy</span>.</p>
    <label><span>Email</span>
        <input type="email" id="createAccountEmailField" name="email" />
    </label>
    <label><span>Password</span>
        <input type="password" id="createAccountPasswordField" name="password" />
    </label>
    <label><span>Confirm Password</span>
        <input type="password" id="createAccountPasswordConfirmField" name="confirmpassword" />
    </label>
    <label><span>Public Name <span class="clickable inline-button" onclick="ExplainPublicName()">?</span></span>
        <input type="text" id="createAccountPublicNameField" name="publicname" />
    </label>
    <label style="display:inline;"><b>Allow Emails</b>
        <input type="checkbox" id="createAccountAllowEmailsField" name="allowemails" checked="checked" />
    </label> <span class="clickable inline-button" onclick="ExplainAllowEmails()">?</span>
    <div id="createAccountError" style="font-weight:bold;color:red;"></div>
    <button type="submit" id="createAccountSubmitButton" onclick="ValidateCreateAccount(); return false;">Create Account</button>
</form></div>
