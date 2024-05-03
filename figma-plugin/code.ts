// figma.on("run", async ({ parameters }: RunEvent) => {
//   const colorsDescription = parameters?.["colorsDescription"];
//   try {
//     const response = await fetch("http://localhost:3000", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ payload: colorsDescription }),
//     });
//     console.log(await response.json());
//   } catch (error) {
//     console.error({ error });
//   }
//   figma.closePlugin();
// });

figma.on("run", async () => {
  const node = figma.currentPage.selection[0] as RectangleNode; // Get the first selected node
  if (!node) {
    console.log("No node selected. Please select a node.");
    figma.closePlugin();
    return;
  }

  if (
    Array.isArray(node.fills) &&
    node.fills.length > 0 &&
    node.fills[0].type === "IMAGE"
  ) {
    const imageFill = node.fills[0] as ImagePaint;
    if (imageFill.imageHash) {
      const image = await figma.getImageByHash(imageFill.imageHash);
      if (image) {
        const imageBytes = await image.getBytesAsync();
        // console.log(imageBytes);
        await sendDataToServer(imageBytes); // Send raw image bytes to server
      } else {
        console.log("Failed to get image data.");
      }
    } else {
      console.log("Selected node does not have an image fill.");
    }
  } else {
    console.log(
      "Selected node does not have image fills or is not a rectangle with an image fill."
    );
  }
  figma.closePlugin();
});

// function arrayBufferToBase64(buffer: ArrayBuffer): string {
//   let binary = "";
//   const bytes = new Uint8Array(buffer);
//   const len = bytes.byteLength;
//   for (let i = 0; i < len; i++) {
//     binary += String.fromCharCode(bytes[i]);
//   }

//   return Buffer.from(binary).toString('base64')
//   // return btoa(binary); // Assuming 'btoa' function is polyfilled or available in your environment
// }

async function sendDataToServer(imageBytes: Uint8Array) {
  const base64Image = arrayBufferToBase64(imageBytes.buffer); // Use the function to encode to base64

  try {
    const response = await fetch("http://localhost:3000/describe-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64Image }),
    });
    const responseData = await response.json();
    console.log(responseData);
  } catch (error) {
    console.error({ error });
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const len = bytes.length;
  const base64Chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let base64 = "";
  let i = 0;

  while (i < len) {
    const byte1 = bytes[i++] || 0;
    const byte2 = bytes[i++] || 0;
    const byte3 = bytes[i++] || 0;

    const b1 = (byte1 >> 2) & 0x3f;
    const b2 = ((byte1 & 0x03) << 4) | ((byte2 >> 4) & 0x0f);
    const b3 = ((byte2 & 0x0f) << 2) | ((byte3 >> 6) & 0x03);
    const b4 = byte3 & 0x3f;

    // Add the actual base64 characters.
    base64 += base64Chars[b1] + base64Chars[b2];
    if (i > len + 1) {
      // Checks if byte2 was padded
      base64 += "==";
    } else if (i > len) {
      // Checks if byte3 was padded
      base64 += base64Chars[b3] + "=";
    } else {
      base64 += base64Chars[b3] + base64Chars[b4];
    }
  }

  return base64;
}
