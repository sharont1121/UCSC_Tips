# This module is used to generate the signed URLs for GCS.
import base64
import time
import urllib.parse

# If these packages are not found, install pycrypto.
# You may need to add this to the requirements.txt
import Crypto.Hash.SHA256 as SHA256
import Crypto.PublicKey.RSA as RSA
import Crypto.Signature.PKCS1_v1_5 as PKCS1_v1_5
import time

def base64sign(plaintext, private_key):
    """Function used to sign the URLs."""
    shahash = SHA256.new(plaintext.encode('utf8'))
    signer = PKCS1_v1_5.new(private_key)
    signature_bytes = signer.sign(shahash)
    return base64.b64encode(signature_bytes)

GCS_API_ENDPOINT = 'https://storage.googleapis.com'

SIGNATURE_STRING = ('{verb}\n'
                    '{content_md5}\n'
                    '{content_type}\n'
                    '{expiration}\n'
                    '{resource}')

def sign_url(path, expiration, account_email, keytext,
             verb='GET', content_type='', content_md5=''):
    """
    Forms and returns the full signed URL to access GCS.
    path: is the name of the GCS file to sign
    expiration: is a datetime object
    account_email: is the email of the account performing isgnature
    keytext: is the key to use for signing (assigned by google)
    verb: only 'GET' supported
    content_type: optional
    content_md5: also optional
    """
    private_key = RSA.importKey(keytext)
    if not path.startswith('/'):
        path = '/'+path
    base_url = '%s%s' % (GCS_API_ENDPOINT, path)
    string_to_sign = SIGNATURE_STRING.format(verb=verb,
                                             content_md5=content_md5,
                                             content_type=content_type,
                                             expiration=expiration,
                                             resource=path)
    print("string to sign:", string_to_sign)
    signature_signed = base64sign(string_to_sign, private_key)
    query_params = {'GoogleAccessId': account_email,
                    'Expires': str(expiration),
                    'Signature': signature_signed}
    return base_url+'?'+urllib.parse.urlencode(query_params)

def gcs_url(keys, path, verb='GET', expiration_secs=1000, content_type=''):
    """Generates a signed URL for GCS.
    :param keys: keys to GCS.
    :param path: path to sign.
    :param verb: action to be allowed (GET, PUT, etc)
    :param expiration_secs: expiration time for URL
    :param content_type: content type, to limit what can be uploaded.
    """
    expiration = int(time.time() + expiration_secs)
    signed_url = sign_url(path, verb=verb, expiration = expiration,
                          content_type=content_type,
                          account_email=keys['client_email'],
                          keytext=keys['private_key']
                          )
    return signed_url
