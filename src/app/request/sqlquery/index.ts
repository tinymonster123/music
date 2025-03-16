import axios from "axios";


const getToken = async () => {
  try {
    const tokenPostData = {
      user: process.env.USER,
      password: process.env.PASSWORD,
    };
    const token = "token"
    const response = await axios.post(
      `${process.env.BASE_URL}/token`,
      tokenPostData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.data){

    }
  } catch (error) {
    console.error(error);
  }
};

const sqlQuery = async (prompt: string) => {
  try {
  } catch (error) {
    console.error(error);
  }
};
