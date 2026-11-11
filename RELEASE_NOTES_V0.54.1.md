# JRVS Property Co. Desktop — V0.54.1 Release Notes

## Photo Studio · RAW development hotfix
- Fixed full-resolution RAW development failing because the decoder was passed the unsupported demosaic option `auto`.
- Full-resolution sensor development now requests FlashRaw's supported `bilinear` demosaic mode.
- Half-size embedded preview generation continues to use the supported `half-size` mode.
- Added a regression check to prevent unsupported demosaic settings from being passed to FlashRaw.
- The original CR2/RAW source remains unchanged and the editor only replaces its current image after successful sensor development.
- No photo library, edit recipe, business record or saved-user-data migration is required.

## Verification note
- Automated CI verifies the RAW decode option and builds the Windows installers.
- Canon EOS 600D CR2 full-resolution output, image quality and installed-app behaviour must still be confirmed on the target Windows PC.
