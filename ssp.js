// found on https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/52171480#52171480
// by bryc
const cyrb53 = function(str, seed = 0) {
	let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
	h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
	return 4294967296 * (2097151 & h2) + (h1>>>0);
};

/**
 * Encrypts plaintext using AES-GCM with supplied password, for decryption with aesGcmDecrypt().
 *                                                                      (c) Chris Veness MIT Licence
 *
 * @param   {String} plaintext - Plaintext to be encrypted.
 * @param   {String} password - Password to use to encrypt plaintext.
 * @returns {String} Encrypted ciphertext.
 *
 * @example
 *   const ciphertext = await aesGcmEncrypt('my secret text', 'pw');
 *   aesGcmEncrypt('my secret text', 'pw').then(function(ciphertext) { console.log(ciphertext); });
 */
async function aesGcmEncrypt(plaintext, password) {
	const pwUtf8 = new TextEncoder().encode(password);
	const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const ivStr = Array.from(iv).map(b => String.fromCharCode(b)).join('');
	const alg = { name: 'AES-GCM', iv: iv };
	const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);
	const ptUint8 = new TextEncoder().encode(plaintext);
	const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8);
	const ctArray = Array.from(new Uint8Array(ctBuffer));
	const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');
	return btoa(ivStr+ctStr);
}
/**
 * Decrypts ciphertext encrypted with aesGcmEncrypt() using supplied password.
 *                                                                      (c) Chris Veness MIT Licence
 *
 * @param   {String} ciphertext - Ciphertext to be decrypted.
 * @param   {String} password - Password to use to decrypt ciphertext.
 * @returns {String} Decrypted plaintext.
 *
 * @example
 *   const plaintext = await aesGcmDecrypt(ciphertext, 'pw');
 *   aesGcmDecrypt(ciphertext, 'pw').then(function(plaintext) { console.log(plaintext); });
 */
async function aesGcmDecrypt(ciphertext, password) {
	const pwUtf8 = new TextEncoder().encode(password);
	const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
	const ivStr = atob(ciphertext).slice(0,12);
	const iv = new Uint8Array(Array.from(ivStr).map(ch => ch.charCodeAt(0)));
	const alg = { name: 'AES-GCM', iv: iv };
	const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);
	const ctStr = atob(ciphertext).slice(12);
	const ctUint8 = new Uint8Array(Array.from(ctStr).map(ch => ch.charCodeAt(0)));
	try {
		const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8);
		const plaintext = new TextDecoder().decode(plainBuffer);
		return plaintext;
	} catch (e) {
		throw new Error('Decrypt failed');
	}
}

// let's go!

$(document).ready(function() {
	persons = ["Select...", "Ashley", "Laura", "Liam", "Marisha", "Sam", "Taliesin", "Travis"];
	destinations = ["Select...", "Aspen, (CO) - Aspen-Pitkin County Airport", "Atlanta (GA) - Hartsfield Atlanta International Airport", "Austin (TX) - Austin-Bergstrom Airport", "Boise (ID) - Boise Air Terminal", "Boston (MA) - General Edward Lawrence Logan", "Bozeman (MT)", "Charlotte (NC)", "Chicago (IL), Midway", "Chicago (IL), O'Hare International Airport", "Cincinnati (OH) - Cincinnati/Northern Kentucky Int'l", "Cleveland (OH) - Cleveland Hopkins International", "Dallas (TX) , Love Field", "Denver (CO) - Denver International Airport", "Detroit (MI) , Wayne County Airport", "Eugene (OR)", "Fort Lauderdale/Hollywood (FL)", "Fort Worth (TX) - Dallas/Fort Worth International Airport", "Fresno (CA)", "Honolulu (HI) - Honolulu International Airport", "Houston (TX) , Hobby", "Houston, TX - George Bush Intercontinental Airport", "Jackson Hole (WY)", "Kahului (HI)", "Kansas City (MO) - Kansas City International Airport", "Kona (HI)", "Las Vegas (NV)", "Medford (OR)", "Memphis (TN)", "Miami (FL)", "Minneapolis - St. Paul International Airport (MN)", "Missula (MT)", "Nashville (TN)", "New Orleans, La", "New York - John F. Kennedy (NY)", "New York - Newark (NJ)", "Oakland (CA)", "Oklahoma City (OK) - Will Rogers World", "Orlando - International Airport (FL)", "Palm Springs (CA)", "Philadelphia (PA) - International", "Phoenix (AZ) - Sky Harbor International", "Pittsburgh International Airport (PA)", "Port Macquarie", "Portland International (OR)", "Puerto Vallarta", "Redmond (OR)", "Reno (NV)", "Sacramento (CA)", "Salt Lake City (UT)", "San Diego - Lindberg Field International (CA)", "San Francisco - International Airport, SA", "San Jose (CA)", "San Luis Obisco (CA)", "Seattle/Tacoma (WA)", "Spokane (WA)", "St. Louis (MO) Lambert–St. Louis International Airport", "Steamboat Springs (CO)", "Sun Valley (ID)", "Tampa - International (FL)", "Tucson (AZ)", "Tulsa (OK)", "Vail (CO)", "Washington DC - Baltimore Washington International", "Washington DC - Dulles International", "Washington DC - Ronald Reagan National"];
	$.each([1,2,3,4], function(val, idx) {
		$.each(persons, function(val, text) {
			$('#person_' + idx).append( $('<option></option>').val(val).html(text) )
		});
		$.each(destinations, function(val, text) {
			$('#destination_' + idx).append( $('<option></option>').val(val).html(text) )
		});
	});

	$(document).on("click", "#check", function() {
		solution = "S3cr3t_Santa";
		$.each([1,2,3,4], function(val, idx) {
			solution += "." + $('#person_' + idx + " option:selected").index();
			solution += "-" + $('#destination_' + idx + " option:selected").index();
		});
		console.log(solution);
		console.log(cyrb53(solution));
		if (cyrb53(solution) == 1917711443357558 ) {
			aesGcmDecrypt('/uch3Og/LrbtottoH/EzZvFSakyjnk+q3yPoS5ZzbUEk0jo=', solution).then(
				function(result) {
					$("#rewardimg").attr("src", "https://i.imgur.com/" + result + '.jpg');
				});
			$("#correctModal").modal({show: true});
		} else {
			$("#incorrectModal").modal({show: true});
		}
		return false;
	});

	$(document).on("click", ".checker", function() {
		switch (this.value) {
			case 'O':
				this.value = '';
				break;
			case '':
				this.value = 'X';
				break;
			case 'X':
				this.value = 'O';
				break;
			default:
				this.value = '';
		}
		this.blur()
	});

	$(document).on("click", "#rewardimg", function() {
		$("#reward").css("display", "none");
		$("#content").css("display", "block");
	});

	$("#correctModal").on("hidden.bs.modal", function(e) {
		$("#reward").css("display", "block");
		$("#content").css("display", "none");
	});

});

// vim: tabstop=2 shiftwidth=2 nowrap
