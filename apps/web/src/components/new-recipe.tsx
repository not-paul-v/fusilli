import { Button } from "./ui/button";
import { useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

export function NewRecipeButton() {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate({ to: "/new-recipe" });
	};

	return (
		<Button onClick={handleClick} size="lg" className="gap-2">
			<PlusIcon className="size-4" />
			New Recipe
		</Button>
	);
}
