import { getToken,onMessage  } from "firebase/messaging";
import { messaging } from "./FirebaseConfig";

const VAPID_KEY = "BOzYGL3bRVR1QAKMb7a-v4MJ5Eo91zFBsuy7pOPalzyxaZSzVWe0mnlyhsiQnXLdq0uXv-pfWJ2NuULmxHZkSl0";

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return;
    }

    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (currentToken) {
      console.log("FCM TOKEN:", currentToken);

      return currentToken;
    } else {
      return "";
      console.log("No registration token available");
    }
  } catch (err) {
    console.log("Error while getting token ", err);
  }
};

// Get Push Notification
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });