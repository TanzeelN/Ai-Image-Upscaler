import { Stack } from "expo-router";

export default function HomeTabStackLayout (){
    return (
    <Stack 
    screenOptions={{headerShown: false}}>

        <Stack.Screen name = "index" />
        <Stack.Screen name = "generated" />
        
    </Stack> 

    )
}