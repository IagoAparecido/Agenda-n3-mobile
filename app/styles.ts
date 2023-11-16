import styled from "styled-components/native";

export const Button = styled.TouchableOpacity`
  padding: 10px;
  border: 1px solid gray;
  border-radius: 5px;
  width: 100%;
  background-color: green;
`;

export const Container = styled.View`
  height: 100%;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: auto;
  width: 90%;
`;
export const ContainerPoke = styled.FlatList`
  margin-bottom: 120px;
`;
export const ScrollContainer = styled.ScrollView`
  width: 100%;
  margin-top: 50px;
`;

export const TextDefault = styled.Text`
  font-size: 20px;
  color: white;
  text-align: center;
`;

export const Img = styled.Image`
  width: 200px;
`;

export const Input = styled.TextInput`
  width: 100%;
  padding: 10px;
  border: 1px solid gray;
  border-radius: 5px;
`;

export const ContainerOptions = styled.View`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 30px;
`;

export const Card = styled.View`
  width: 70%;
  margin: auto;
  height: 300px;
  border: 1px solid gray;
  border-radius: 5px;
  margin-bottom: 30px;
  justify-content: center;
  align-items: center;
`;
