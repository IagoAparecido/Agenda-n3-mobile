import styled from "styled-components/native";

export const Container = styled.ScrollView`
  padding-horizontal: 20px;
`;
export const ContainerEventos = styled.View`
  padding-vertical: 20px;
`;
export const ContainerAgendamentosDia = styled.View`
  margin-bottom: 5px;
`;
export const ModalContainer = styled.ScrollView`
  flex: 1;
  padding: 20px;
`;

export const ModalContent = styled.View`
  flex: 1;
  justify-content: center;
  margin-bottom: 20px;
`;
export const ConteinerAgendamentos = styled.Pressable`
  flex-direction: collumn;
  margin-bottom: 10px;
`;
export const AddEventoContainer = styled.View`
  flex: 1;
  justify-content: center;
  padding: 10px;
  border: 1px solid #6c757d;
  border-radius: 10px;
  margin-bottom: 40px;
`;

export const TextoEventos = styled.Text`
  font-size: 24px;
  margin-top: 10px;
  margin-bottom: 10px;
`;
export const ModalTitle = styled.Text`
  font-size: 20px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 30px;
  margin-top: 10px;
`;
export const TextAgendamentosDia = styled.Text`
  font-size: 18px;
  color: #212529;
`;
export const HorarioAgendamentosDia = styled.Text`
  border-bottom-width: 1px;
  border-color: #6c757d;
  font-size: 14px;
  padding-bottom: 10px;
  color: #6c757d;
`;

export const IconFechar = styled.TouchableOpacity`
  padding-vertical: 10px;
  margin-bottom: 10px;
`;
export const Input = styled.TextInput`
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #adb5bd;
  border-radius: 5px;
  height: 50px;
  color: #474448;
`;
